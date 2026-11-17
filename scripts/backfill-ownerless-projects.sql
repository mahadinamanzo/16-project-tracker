-- Replace the placeholder with your GitHub numeric account ID before running.
UPDATE projects AS p
SET owner_id = u.id
FROM users AS u
WHERE p.owner_id IS NULL
  AND u.github_id = 'REPLACE_WITH_YOUR_GITHUB_ID'
RETURNING p.id, p.name, p.owner_id;
