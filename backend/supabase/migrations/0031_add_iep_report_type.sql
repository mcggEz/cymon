-- Migration: 0031_add_iep_report_type.sql
-- Add 'iep' to report_type enum

ALTER TYPE public.report_type ADD VALUE IF NOT EXISTS 'iep';
