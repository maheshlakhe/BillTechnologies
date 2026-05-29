-- Migrate plan types: BASIC→STARTER, PREMIUM→GROWTH
-- Column in SQLite is "planType" (camelCase)
UPDATE users SET planType = 'STARTER' WHERE planType = 'BASIC';
UPDATE users SET planType = 'GROWTH' WHERE planType = 'PREMIUM';
-- ENTERPRISE stays as-is (now the top custom tier)
-- PRO is a new tier; existing rows unaffected

-- Feature flags: update required_plan column
UPDATE feature_flags SET required_plan = 'STARTER' WHERE required_plan = 'BASIC';
UPDATE feature_flags SET required_plan = 'GROWTH' WHERE required_plan = 'PREMIUM';
