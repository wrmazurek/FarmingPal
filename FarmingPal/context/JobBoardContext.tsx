import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { sendPushToUser } from '@/lib/notifications';
import type { JobPosting, JobQuote, JobThread, JobMessage, JobStatus, QuoteStatus } from '@/types';

// ─── UUID helper ──────────────────────────────────────────────────────────────

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ─── Row → type mappers ───────────────────────────────────────────────────────

function rowToJob(r: Record<string, any>): JobPosting {
  return {
    id:           r.id,
    farmerId:     r.farmer_id,
    farmerName:   r.farmer_name,
    services:     r.services ?? [],
    acres:        r.acres,
    startDate:    r.start_date,
    endDate:      r.end_date,
    crop:         r.crop,
    terrain:      r.terrain,
    notes:        r.notes ?? '',
    districtCode: r.district_code,
    regionCode:   r.region_code,
    country:      r.country,
    status:       r.status,
    postedAt:     r.posted_at,
  };
}

function rowToQuote(r: Record<string, any>): JobQuote {
  return {
    id:            r.id,
    jobId:         r.job_id,
    operatorId:    r.operator_id,
    operatorName:  r.operator_name,
    businessName:  r.business_name,
    ratePerAcre:   r.rate_per_acre,
    message:       r.message ?? '',
    status:        r.status,
    submittedAt:   r.submitted_at,
  };
}

function rowToThread(r: Record<string, any>, messages: JobMessage[] = []): JobThread {
  return {
    id:            r.id,
    jobId:         r.job_id,
    jobTitle:      r.job_title,
    farmerId:      r.farmer_id,
    operatorId:    r.operator_id,
    operatorName:  r.operator_name,
    messages,
    createdAt:     r.created_at,
    lastMessageAt: r.last_message_at,
  };
}

function rowToMessage(r: Record<string, any>): JobMessage {
  return {
    id:         r.id,
    threadId:   r.thread_id,
    senderId:   r.sender_id,
    senderName: r.sender_name,
    body:       r.body,
    sentAt:     r.sent_at,
    readAt:     r.read_at ?? undefined,
  };
}

// ─── Context definition ───────────────────────────────────────────────────────

interface JobBoardContextValue {
  jobs:    JobPosting[];
  quotes:  JobQuote[];
  threads: JobThread[];
  loading: boolean;

  postJob:           (posting: Omit<JobPosting, 'id' | 'postedAt' | 'status'>) => string;
  updateJobStatus:   (jobId: string, status: JobStatus) => void;
  getMyJobs:         (farmerId: string) => JobPosting[];
  getQuotesForJob:   (jobId: string) => JobQuote[];
  acceptQuote:       (quoteId: string, jobId: string) => void;
  declineQuote:      (quoteId: string) => void;

  getJobsForDistrict: (districtCode: string) => JobPosting[];
  submitQuote:        (quote: Omit<JobQuote, 'id' | 'submittedAt' | 'status'>) => void;
  getMyQuotes:        (operatorId: string) => JobQuote[];

  getThread:         (jobId: string, farmerId: string, operatorId: string) => JobThread | undefined;
  sendMessage:       (threadId: string, senderId: string, senderName: string, body: string) => void;
  openThread:        (jobId: string, jobTitle: string, farmerId: string, operatorId: string, operatorName: string) => string;
  getThreadsForUser: (userId: string) => JobThread[];
  markThreadRead:    (threadId: string, userId: string) => void;
  getUnreadCount:    (userId: string) => number;
}

const JobBoardContext = createContext<JobBoardContextValue | null>(null);

export function JobBoardProvider({ children }: { children: React.ReactNode }) {
  const [jobs,    setJobs]    = useState<JobPosting[]>([]);
  const [quotes,  setQuotes]  = useState<JobQuote[]>([]);
  const [threads, setThreads] = useState<JobThread[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [jobsRes, quotesRes, threadsRes, msgsRes] = await Promise.all([
      supabase.from('job_postings').select('*').order('posted_at', { ascending: false }),
      supabase.from('job_quotes').select('*').order('submitted_at', { ascending: true }),
      supabase.from('job_threads').select('*').order('last_message_at', { ascending: false }),
      supabase.from('job_messages').select('*').order('sent_at', { ascending: true }),
    ]);

    const msgs = (msgsRes.data ?? []).map(rowToMessage);
    const parsedThreads = (threadsRes.data ?? []).map(row =>
      rowToThread(row, msgs.filter(m => m.threadId === row.id))
    );

    setJobs((jobsRes.data ?? []).map(rowToJob));
    setQuotes((quotesRes.data ?? []).map(rowToQuote));
    setThreads(parsedThreads);
    setLoading(false);
  }, []);

  // Load on mount and reload whenever auth state changes (sign-in / sign-out)
  useEffect(() => {
    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });
    return () => subscription.unsubscribe();
  }, [loadData]);

  // ── Farmer actions ────────────────────────────────────────────────────────

  const postJob = useCallback((posting: Omit<JobPosting, 'id' | 'postedAt' | 'status'>): string => {
    const id  = generateUUID();
    const now = new Date().toISOString();
    const job: JobPosting = { ...posting, id, status: 'open', postedAt: now };
    setJobs(prev => [job, ...prev]);
    supabase.from('job_postings').insert({
      id,
      farmer_id:    posting.farmerId,
      farmer_name:  posting.farmerName,
      services:     posting.services,
      acres:        posting.acres,
      start_date:   posting.startDate,
      end_date:     posting.endDate,
      crop:         posting.crop,
      terrain:      posting.terrain,
      notes:        posting.notes,
      district_code: posting.districtCode,
      region_code:  posting.regionCode,
      country:      posting.country,
      status:       'open',
      posted_at:    now,
    }).then(({ error }) => { if (error) console.error('[JobBoard] postJob:', error.message); });
    return id;
  }, []);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status } : j));
    supabase.from('job_postings').update({ status }).eq('id', jobId)
      .then(({ error }) => { if (error) console.error('[JobBoard] updateJobStatus:', error.message); });
  }, []);

  const getMyJobs = useCallback((farmerId: string) =>
    jobs.filter(j => j.farmerId === farmerId).sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
  [jobs]);

  const getQuotesForJob = useCallback((jobId: string) =>
    quotes.filter(q => q.jobId === jobId).sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
  [quotes]);

  const acceptQuote = useCallback((quoteId: string, jobId: string) => {
    const accepted = quotes.find(q => q.id === quoteId);
    setQuotes(prev => prev.map(q =>
      q.id === quoteId   ? { ...q, status: 'accepted' as QuoteStatus } :
      q.jobId === jobId  ? { ...q, status: 'declined' as QuoteStatus } : q
    ));
    updateJobStatus(jobId, 'filled');
    supabase.from('job_quotes').update({ status: 'accepted' }).eq('id', quoteId)
      .then(({ error }) => { if (error) console.error('[JobBoard] acceptQuote:', error.message); });
    supabase.from('job_quotes').update({ status: 'declined' }).eq('job_id', jobId).neq('id', quoteId)
      .then(({ error }) => { if (error) console.error('[JobBoard] declineOthers:', error.message); });

    if (accepted) {
      sendPushToUser(accepted.operatorId, 'Quote Accepted! 🎉',
        `Your quote for the ${accepted.businessName ?? 'job'} was accepted. Check your messages.`,
        { screen: 'job-board' }
      ).catch(() => {});
    }
  }, [updateJobStatus, quotes]);

  const declineQuote = useCallback((quoteId: string) => {
    const declined = quotes.find(q => q.id === quoteId);
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'declined' as QuoteStatus } : q));
    supabase.from('job_quotes').update({ status: 'declined' }).eq('id', quoteId)
      .then(({ error }) => { if (error) console.error('[JobBoard] declineQuote:', error.message); });

    if (declined) {
      sendPushToUser(declined.operatorId, 'Quote Update',
        'A quote you submitted was declined by the farmer.',
        { screen: 'job-board' }
      ).catch(() => {});
    }
  }, [quotes]);

  // ── Operator actions ──────────────────────────────────────────────────────

  const getJobsForDistrict = useCallback((districtCode: string) =>
    jobs.filter(j => j.districtCode === districtCode && j.status === 'open')
        .sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
  [jobs]);

  const submitQuote = useCallback((quote: Omit<JobQuote, 'id' | 'submittedAt' | 'status'>) => {
    const id  = generateUUID();
    const now = new Date().toISOString();
    const newQuote: JobQuote = { ...quote, id, status: 'pending', submittedAt: now };
    setQuotes(prev => [...prev, newQuote]);
    supabase.from('job_quotes').insert({
      id,
      job_id:        quote.jobId,
      operator_id:   quote.operatorId,
      operator_name: quote.operatorName,
      business_name: quote.businessName,
      rate_per_acre: quote.ratePerAcre,
      message:       quote.message,
      status:        'pending',
      submitted_at:  now,
    }).then(({ error }) => { if (error) console.error('[JobBoard] submitQuote:', error.message); });

    // Notify the farmer that a new quote arrived
    const job = jobs.find(j => j.id === quote.jobId);
    if (job) {
      sendPushToUser(
        job.farmerId,
        'New Quote Received',
        `${quote.operatorName} sent a quote for your ${job.services[0] ?? 'job'}.`,
        { screen: 'job-applicants', jobId: job.id }
      ).catch(() => {});
    }
  }, [jobs]);

  const getMyQuotes = useCallback((operatorId: string) =>
    quotes.filter(q => q.operatorId === operatorId),
  [quotes]);

  // ── Messaging ─────────────────────────────────────────────────────────────

  const getThread = useCallback((jobId: string, farmerId: string, operatorId: string) =>
    threads.find(t => t.jobId === jobId && t.farmerId === farmerId && t.operatorId === operatorId),
  [threads]);

  const openThread = useCallback((jobId: string, jobTitle: string, farmerId: string, operatorId: string, operatorName: string): string => {
    const existing = threads.find(t => t.jobId === jobId && t.farmerId === farmerId && t.operatorId === operatorId);
    if (existing) return existing.id;
    const id  = generateUUID();
    const now = new Date().toISOString();
    const thread: JobThread = { id, jobId, jobTitle, farmerId, operatorId, operatorName, messages: [], createdAt: now, lastMessageAt: now };
    setThreads(prev => [...prev, thread]);
    supabase.from('job_threads').insert({
      id,
      job_id:          jobId,
      job_title:       jobTitle,
      farmer_id:       farmerId,
      operator_id:     operatorId,
      operator_name:   operatorName,
      created_at:      now,
      last_message_at: now,
    }).then(({ error }) => { if (error) console.error('[JobBoard] openThread:', error.message); });
    return id;
  }, [threads]);

  const sendMessage = useCallback((threadId: string, senderId: string, senderName: string, body: string) => {
    const id  = generateUUID();
    const now = new Date().toISOString();
    const msg: JobMessage = { id, threadId, senderId, senderName, body, sentAt: now };
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, messages: [...t.messages, msg], lastMessageAt: now }
        : t
    ));
    supabase.from('job_messages').insert({
      id,
      thread_id:   threadId,
      sender_id:   senderId,
      sender_name: senderName,
      body,
      sent_at:     now,
    }).then(({ error }) => { if (error) console.error('[JobBoard] sendMessage:', error.message); });
    supabase.from('job_threads').update({ last_message_at: now }).eq('id', threadId)
      .then(({ error }) => { if (error) console.error('[JobBoard] updateThread:', error.message); });

    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      const recipientId = thread.farmerId === senderId ? thread.operatorId : thread.farmerId;
      sendPushToUser(
        recipientId,
        'New Message',
        `${senderName}: ${body.slice(0, 80)}`,
        { screen: 'job-thread', threadId }
      ).catch(() => {});
    }
  }, [threads]);

  const getThreadsForUser = useCallback((userId: string) =>
    threads
      .filter(t => t.farmerId === userId || t.operatorId === userId)
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
  [threads]);

  const markThreadRead = useCallback((threadId: string, userId: string) => {
    const now = new Date().toISOString();
    setThreads(prev => prev.map(t =>
      t.id === threadId
        ? { ...t, messages: t.messages.map(m =>
            m.senderId !== userId && !m.readAt ? { ...m, readAt: now } : m
          )}
        : t
    ));
    // Mark messages read in Supabase
    supabase.from('job_messages')
      .update({ read_at: now })
      .eq('thread_id', threadId)
      .neq('sender_id', userId)
      .is('read_at', null)
      .then(({ error }) => { if (error) console.error('[JobBoard] markThreadRead:', error.message); });
  }, []);

  const getUnreadCount = useCallback((userId: string) =>
    threads
      .filter(t => t.farmerId === userId || t.operatorId === userId)
      .reduce((count, t) =>
        count + t.messages.filter(m => m.senderId !== userId && !m.readAt).length, 0
      ),
  [threads]);

  return (
    <JobBoardContext.Provider value={{
      jobs, quotes, threads, loading,
      postJob, updateJobStatus, getMyJobs, getQuotesForJob, acceptQuote, declineQuote,
      getJobsForDistrict, submitQuote, getMyQuotes,
      getThread, openThread, sendMessage, getThreadsForUser, markThreadRead, getUnreadCount,
    }}>
      {children}
    </JobBoardContext.Provider>
  );
}

export function useJobBoard() {
  const ctx = useContext(JobBoardContext);
  if (!ctx) throw new Error('useJobBoard must be inside JobBoardProvider');
  return ctx;
}
