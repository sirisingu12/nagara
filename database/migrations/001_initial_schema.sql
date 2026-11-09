CREATE TABLE districts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(40) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_districts_code (code),
  UNIQUE KEY uq_districts_name (name)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE municipalities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  district_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(40) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_municipalities_code (code),
  UNIQUE KEY uq_municipalities_district_name (district_id, name),
  UNIQUE KEY uq_municipalities_id_district (id, district_id),
  KEY idx_municipalities_district (district_id),
  CONSTRAINT fk_municipalities_district
    FOREIGN KEY (district_id) REFERENCES districts (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE localities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  municipality_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_localities_municipality_name (municipality_id, name),
  UNIQUE KEY uq_localities_id_municipality (id, municipality_id),
  CONSTRAINT fk_localities_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE departments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  municipality_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_municipality_name (municipality_id, name),
  UNIQUE KEY uq_departments_id_municipality (id, municipality_id),
  KEY idx_departments_municipality_active (municipality_id, is_active),
  CONSTRAINT fk_departments_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(32) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'officer', 'worker') NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  home_district_id BIGINT UNSIGNED NULL,
  home_municipality_id BIGINT UNSIGNED NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_active (role, is_active),
  KEY idx_users_department (department_id),
  KEY idx_users_home_municipality (home_municipality_id),
  CONSTRAINT chk_users_home_location CHECK (
    (home_district_id IS NULL AND home_municipality_id IS NULL)
    OR (home_district_id IS NOT NULL AND home_municipality_id IS NOT NULL)
  ),
  CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_users_home_municipality_district
    FOREIGN KEY (home_municipality_id, home_district_id)
    REFERENCES municipalities (id, district_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_municipalities (
  user_id BIGINT UNSIGNED NOT NULL,
  municipality_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (user_id, municipality_id),
  KEY idx_user_municipalities_municipality (municipality_id, user_id),
  CONSTRAINT fk_user_municipalities_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_user_municipalities_municipality
    FOREIGN KEY (municipality_id) REFERENCES municipalities (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  description VARCHAR(500) NULL,
  icon_key VARCHAR(60) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_slug (slug),
  UNIQUE KEY uq_categories_name (name),
  KEY idx_categories_active (is_active)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE priority_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rule_key VARCHAR(64) NOT NULL,
  category_id BIGINT UNSIGNED NULL,
  safety_risk BOOLEAN NULL,
  min_people_affected INT UNSIGNED NULL,
  min_age_hours INT UNSIGNED NULL,
  priority ENUM('critical', 'high', 'medium', 'low') NOT NULL,
  sla_hours INT UNSIGNED NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_priority_rules_key (rule_key),
  KEY idx_priority_rules_match (is_active, category_id, safety_risk, priority),
  CONSTRAINT chk_priority_rules_sla CHECK (sla_hours > 0),
  CONSTRAINT fk_priority_rules_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaints (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reference_code VARCHAR(40) NOT NULL,
  citizen_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  district_id BIGINT UNSIGNED NOT NULL,
  municipality_id BIGINT UNSIGNED NOT NULL,
  locality_id BIGINT UNSIGNED NULL,
  department_id BIGINT UNSIGNED NULL,
  title VARCHAR(240) NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  status ENUM(
    'submitted', 'under_verification', 'assigned', 'in_progress', 'on_hold',
    'resolution_submitted', 'resolved', 'reopened', 'rejected'
  ) NOT NULL DEFAULT 'submitted',
  priority ENUM('critical', 'high', 'medium', 'low') NOT NULL DEFAULT 'medium',
  priority_source ENUM('rule', 'officer') NOT NULL DEFAULT 'rule',
  priority_reason VARCHAR(1000) NULL,
  people_affected INT UNSIGNED NULL,
  safety_risk BOOLEAN NOT NULL DEFAULT FALSE,
  deadline_at DATETIME(3) NULL,
  is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
  duplicate_of_id BIGINT UNSIGNED NULL,
  duplicate_score DECIMAL(5,4) NULL,
  rejection_reason VARCHAR(1000) NULL,
  reopen_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  submitted_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  verified_at DATETIME(3) NULL,
  resolved_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_complaints_reference_code (reference_code),
  KEY idx_complaints_municipality_status_created (municipality_id, status, created_at),
  KEY idx_complaints_citizen_created (citizen_id, created_at),
  KEY idx_complaints_category_municipality_created (category_id, municipality_id, created_at),
  KEY idx_complaints_department_status (department_id, status),
  KEY idx_complaints_deadline_status_overdue (deadline_at, status, is_overdue),
  KEY idx_complaints_locality (locality_id),
  KEY idx_complaints_duplicate (duplicate_of_id),
  CONSTRAINT chk_complaints_latitude CHECK (latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_complaints_longitude CHECK (longitude BETWEEN -180 AND 180),
  CONSTRAINT chk_complaints_duplicate_score CHECK (
    duplicate_score IS NULL OR duplicate_score BETWEEN 0 AND 1
  ),
  CONSTRAINT fk_complaints_citizen
    FOREIGN KEY (citizen_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_category
    FOREIGN KEY (category_id) REFERENCES categories (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_municipality_district
    FOREIGN KEY (municipality_id, district_id)
    REFERENCES municipalities (id, district_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_locality_municipality
    FOREIGN KEY (locality_id, municipality_id)
    REFERENCES localities (id, municipality_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_department_municipality
    FOREIGN KEY (department_id, municipality_id)
    REFERENCES departments (id, municipality_id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaints_duplicate
    FOREIGN KEY (duplicate_of_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE refresh_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME(3) NOT NULL,
  revoked_at DATETIME(3) NULL,
  replaced_by_id BIGINT UNSIGNED NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user_revoked (user_id, revoked_at),
  KEY idx_refresh_tokens_expires (expires_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_refresh_tokens_replaced_by
    FOREIGN KEY (replaced_by_id) REFERENCES refresh_tokens (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_images (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_complaint_images_storage_key (storage_key),
  KEY idx_complaint_images_complaint_created (complaint_id, created_at),
  CONSTRAINT fk_complaint_images_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_images_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE assignments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  worker_id BIGINT UNSIGNED NOT NULL,
  officer_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'completed') NOT NULL DEFAULT 'pending',
  rejection_reason VARCHAR(1000) NULL,
  assigned_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  responded_at DATETIME(3) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_assignments_complaint_assigned (complaint_id, assigned_at),
  KEY idx_assignments_worker_status (worker_id, status),
  KEY idx_assignments_officer_status (officer_id, status),
  CONSTRAINT fk_assignments_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_assignments_worker
    FOREIGN KEY (worker_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_assignments_officer
    FOREIGN KEY (officer_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE complaint_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  from_status ENUM(
    'submitted', 'under_verification', 'assigned', 'in_progress', 'on_hold',
    'resolution_submitted', 'resolved', 'reopened', 'rejected'
  ) NULL,
  to_status ENUM(
    'submitted', 'under_verification', 'assigned', 'in_progress', 'on_hold',
    'resolution_submitted', 'resolved', 'reopened', 'rejected'
  ) NOT NULL,
  changed_by BIGINT UNSIGNED NOT NULL,
  note VARCHAR(1000) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_complaint_status_history_complaint_created (complaint_id, created_at),
  KEY idx_complaint_status_history_actor (changed_by, created_at),
  CONSTRAINT fk_complaint_status_history_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_complaint_status_history_actor
    FOREIGN KEY (changed_by) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE comments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  visibility ENUM('public', 'internal') NOT NULL DEFAULT 'public',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_comments_complaint_visibility_created (complaint_id, visibility, created_at),
  KEY idx_comments_user_created (user_id, created_at),
  CONSTRAINT fk_comments_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE resolution_evidence (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  assignment_id BIGINT UNSIGNED NOT NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  kind ENUM('before', 'after', 'progress', 'blocker') NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NULL,
  note VARCHAR(2000) NULL,
  review_status ENUM('pending', 'approved', 'rework') NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_resolution_evidence_storage_key (storage_key),
  KEY idx_resolution_evidence_complaint_created (complaint_id, created_at),
  KEY idx_resolution_evidence_assignment_review (assignment_id, review_status),
  KEY idx_resolution_evidence_uploader (uploaded_by, created_at),
  CONSTRAINT fk_resolution_evidence_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_resolution_evidence_assignment
    FOREIGN KEY (assignment_id) REFERENCES assignments (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_resolution_evidence_uploader
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  citizen_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment VARCHAR(2000) NULL,
  cycle TINYINT UNSIGNED NOT NULL DEFAULT 1,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_complaint_cycle (complaint_id, cycle),
  KEY idx_feedback_citizen_created (citizen_id, created_at),
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_feedback_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_feedback_citizen
    FOREIGN KEY (citizen_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body VARCHAR(2000) NOT NULL,
  complaint_id BIGINT UNSIGNED NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_notifications_user_read_created (user_id, is_read, created_at),
  KEY idx_notifications_complaint (complaint_id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_notifications_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE sla_extensions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  complaint_id BIGINT UNSIGNED NOT NULL,
  previous_deadline DATETIME(3) NOT NULL,
  new_deadline DATETIME(3) NOT NULL,
  reason VARCHAR(1000) NOT NULL,
  extended_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_sla_extensions_complaint_created (complaint_id, created_at),
  KEY idx_sla_extensions_actor (extended_by, created_at),
  CONSTRAINT chk_sla_extensions_deadline CHECK (new_deadline > previous_deadline),
  CONSTRAINT fk_sla_extensions_complaint
    FOREIGN KEY (complaint_id) REFERENCES complaints (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT,
  CONSTRAINT fk_sla_extensions_actor
    FOREIGN KEY (extended_by) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NOT NULL,
  metadata JSON NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_audit_logs_entity_created (entity_type, entity_id, created_at),
  KEY idx_audit_logs_user_created (user_id, created_at),
  KEY idx_audit_logs_action_created (action, created_at),
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON UPDATE RESTRICT ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
