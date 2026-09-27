-- Forgot-password flow: a SHA-256 hash of the emailed reset token (never the
-- raw token itself) plus its expiry, so a leaked DB row alone can't be used
-- to reset an account's password.
ALTER TABLE users
  ADD COLUMN reset_token_hash VARCHAR(64) NULL,
  ADD COLUMN reset_token_expires_at TIMESTAMP NULL;

CREATE INDEX idx_users_reset_token_hash ON users (reset_token_hash);
