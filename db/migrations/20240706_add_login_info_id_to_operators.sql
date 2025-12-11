-- Link operators to login records
ALTER TABLE operators
    ADD COLUMN login_info_id BIGINT NULL AFTER name;

CREATE INDEX idx_operators_login_info_id ON operators (login_info_id);
