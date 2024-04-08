\echo 'Delete and recreate gamebuddy db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE gamebuddy;
CREATE DATABASE gamebuddy;
\connect gamebuddy

\i gb-schema.sql

\echo 'Delete and recreate gb_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE gb_test;
CREATE DATABASE gb_test;
\connect gb_test

\i gb-schema.sql
