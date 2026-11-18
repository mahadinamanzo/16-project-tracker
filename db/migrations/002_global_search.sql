CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS projects_name_trgm_idx
  ON projects USING GIN (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS projects_description_trgm_idx
  ON projects USING GIN (description gin_trgm_ops);

CREATE INDEX IF NOT EXISTS tasks_title_trgm_idx
  ON tasks USING GIN (title gin_trgm_ops);
