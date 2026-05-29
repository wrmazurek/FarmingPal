-- Livestock price submissions
-- Prices are reported per cwt (hundredweight = 100 lbs), consistent with
-- North American auction market and feedlot reporting conventions.

CREATE TABLE livestock_submissions (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id  text         NOT NULL,
  price         numeric(10,4) NOT NULL CHECK (price > 0),
  currency      fp_currency  NOT NULL,
  buyer_name    text         NOT NULL,
  district_code text         NOT NULL,
  region_code   text         NOT NULL,
  country       fp_country   NOT NULL,
  submitted_by  uuid         REFERENCES auth.users ON DELETE SET NULL,
  submitted_at  timestamptz  DEFAULT now()
);

CREATE INDEX idx_livestock_district ON livestock_submissions(district_code);
CREATE INDEX idx_livestock_type     ON livestock_submissions(livestock_id);
CREATE INDEX idx_livestock_at       ON livestock_submissions(submitted_at DESC);
