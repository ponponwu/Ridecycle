# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_07_04_025029) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "bicycle_images", force: :cascade do |t|
    t.bigint "bicycle_id", null: false
    t.string "image_url"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bicycle_id"], name: "index_bicycle_images_on_bicycle_id"
  end

  create_table "bicycle_models", force: :cascade do |t|
    t.string "name"
    t.integer "year"
    t.bigint "brand_id", null: false
    t.decimal "msrp"
    t.decimal "original_msrp"
    t.boolean "is_frameset"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "transmission_id"
    t.integer "bicycle_type"
    t.integer "frame_material"
    t.integer "color"
    t.text "frame_sizes_available"
    t.text "description"
    t.index ["bicycle_type"], name: "index_bicycle_models_on_bicycle_type"
    t.index ["brand_id", "bicycle_type"], name: "index_bicycle_models_on_brand_id_and_bicycle_type"
    t.index ["brand_id"], name: "index_bicycle_models_on_brand_id"
    t.index ["color"], name: "index_bicycle_models_on_color"
    t.index ["frame_material"], name: "index_bicycle_models_on_frame_material"
    t.index ["transmission_id"], name: "index_bicycle_models_on_transmission_id"
    t.index ["year", "bicycle_type"], name: "index_bicycle_models_on_year_and_bicycle_type"
    t.index ["year"], name: "index_bicycle_models_on_year"
  end

  create_table "bicycles", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.decimal "price"
    t.integer "condition", default: 0
    t.string "model"
    t.integer "year"
    t.string "frame_size"
    t.string "location"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "contact_method"
    t.bigint "brand_id"
    t.bigint "bicycle_model_id"
    t.bigint "transmission_id"
    t.integer "bicycle_type"
    t.integer "frame_material"
    t.integer "color"
    t.boolean "is_frameset_only", default: false
    t.integer "status", default: 0
    t.index ["bicycle_model_id"], name: "index_bicycles_on_bicycle_model_id"
    t.index ["bicycle_type", "price"], name: "index_bicycles_on_bicycle_type_and_price"
    t.index ["bicycle_type"], name: "index_bicycles_on_bicycle_type"
    t.index ["brand_id", "bicycle_type"], name: "index_bicycles_on_brand_id_and_bicycle_type"
    t.index ["brand_id"], name: "index_bicycles_on_brand_id"
    t.index ["color"], name: "index_bicycles_on_color"
    t.index ["frame_material"], name: "index_bicycles_on_frame_material"
    t.index ["is_frameset_only"], name: "index_bicycles_on_is_frameset_only"
    t.index ["location", "bicycle_type"], name: "index_bicycles_on_location_and_bicycle_type"
    t.index ["status"], name: "index_bicycles_on_status"
    t.index ["transmission_id"], name: "index_bicycles_on_transmission_id"
    t.index ["user_id"], name: "index_bicycles_on_user_id"
    t.index ["year", "bicycle_type"], name: "index_bicycles_on_year_and_bicycle_type"
  end

  create_table "brands", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "components", force: :cascade do |t|
    t.string "name"
    t.bigint "bicycle_models_id"
    t.bigint "component_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bicycle_models_id"], name: "index_components_on_bicycle_models_id"
    t.index ["component_id"], name: "index_components_on_component_id"
  end

  create_table "csp_violation_reports", force: :cascade do |t|
    t.string "directive", null: false
    t.text "blocked_uri", null: false
    t.text "source_file"
    t.integer "line_number"
    t.integer "column_number"
    t.text "user_agent", null: false
    t.text "url", null: false
    t.datetime "timestamp"
    t.string "ip_address", null: false
    t.text "referrer"
    t.string "session_id"
    t.bigint "user_id"
    t.string "environment", default: "production"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blocked_uri"], name: "index_csp_violation_reports_on_blocked_uri"
    t.index ["created_at"], name: "index_csp_violation_reports_on_created_at"
    t.index ["directive", "blocked_uri"], name: "index_csp_violation_reports_on_directive_and_blocked_uri"
    t.index ["directive", "created_at"], name: "index_csp_violation_reports_on_directive_and_created_at"
    t.index ["directive"], name: "index_csp_violation_reports_on_directive"
    t.index ["environment", "created_at"], name: "index_csp_violation_reports_on_environment_and_created_at"
    t.index ["environment"], name: "index_csp_violation_reports_on_environment"
    t.index ["ip_address"], name: "index_csp_violation_reports_on_ip_address"
    t.index ["session_id"], name: "index_csp_violation_reports_on_session_id"
    t.index ["user_id"], name: "index_csp_violation_reports_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.integer "sender_id"
    t.integer "recipient_id"
    t.text "content"
    t.bigint "bicycle_id", null: false
    t.boolean "is_read", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "read_at"
    t.boolean "is_offer", default: false, null: false
    t.decimal "offer_amount", precision: 10, scale: 2
    t.integer "offer_status", default: 0
    t.index ["bicycle_id", "offer_status"], name: "index_messages_on_bicycle_and_offer_status"
    t.index ["bicycle_id"], name: "index_messages_on_bicycle_id"
    t.index ["sender_id", "bicycle_id", "offer_status"], name: "index_messages_on_sender_bicycle_offer_status"
  end

  create_table "order_payments", force: :cascade do |t|
    t.bigint "order_id", null: false
    t.integer "status", default: 0, null: false
    t.integer "method", default: 0, null: false
    t.string "payment_id"
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.datetime "deadline", null: false
    t.datetime "expires_at", null: false
    t.text "instructions"
    t.text "company_account_info"
    t.jsonb "metadata", default: {}
    t.datetime "paid_at"
    t.datetime "failed_at"
    t.string "failure_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_order_payments_on_expires_at"
    t.index ["order_id"], name: "index_order_payments_on_order_id"
    t.index ["payment_id"], name: "index_order_payments_on_payment_id", unique: true, where: "(payment_id IS NOT NULL)"
    t.index ["status", "expires_at"], name: "index_order_payments_on_status_and_expires_at"
    t.index ["status"], name: "index_order_payments_on_status"
  end

  create_table "orders", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "bicycle_id", null: false
    t.string "order_number", null: false
    t.integer "status", default: 0, null: false
    t.decimal "subtotal", precision: 10, scale: 2
    t.decimal "shipping_cost", precision: 10, scale: 2
    t.decimal "tax", precision: 10, scale: 2
    t.decimal "total_price", precision: 10, scale: 2, null: false
    t.jsonb "shipping_address"
    t.jsonb "payment_details"
    t.string "tracking_number"
    t.string "carrier"
    t.text "notes"
    t.text "cancel_reason"
    t.datetime "estimated_delivery_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.decimal "shipping_distance", precision: 10, scale: 2
    t.integer "shipping_method", default: 0
    t.index ["bicycle_id"], name: "index_orders_on_bicycle_id"
    t.index ["order_number"], name: "index_orders_on_order_number", unique: true
    t.index ["user_id"], name: "index_orders_on_user_id"
  end

  create_table "refresh_tokens", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "token", null: false
    t.datetime "expires_at", null: false
    t.datetime "revoked_at"
    t.datetime "last_used_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at", "revoked_at"], name: "index_refresh_tokens_on_expires_at_and_revoked_at"
    t.index ["expires_at"], name: "index_refresh_tokens_on_expires_at"
    t.index ["revoked_at"], name: "index_refresh_tokens_on_revoked_at"
    t.index ["token"], name: "index_refresh_tokens_on_token", unique: true
    t.index ["user_id"], name: "index_refresh_tokens_on_user_id"
  end

  create_table "site_configurations", force: :cascade do |t|
    t.string "setting_key", null: false
    t.text "setting_value", null: false
    t.string "setting_type", default: "string"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["setting_key"], name: "index_site_configurations_on_setting_key", unique: true
  end

  create_table "transmissions", force: :cascade do |t|
    t.string "name", null: false
    t.bigint "bicycle_models_id"
    t.bigint "component_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bicycle_models_id"], name: "index_transmissions_on_bicycle_models_id"
    t.index ["component_id"], name: "index_transmissions_on_component_id"
    t.index ["name"], name: "index_transmissions_on_name", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "provider"
    t.string "uid"
    t.boolean "admin", default: false, null: false
    t.text "bank_account_name"
    t.text "bank_account_number"
    t.text "bank_code"
    t.text "bank_branch"
    t.boolean "is_suspicious", default: false, null: false
    t.boolean "is_blacklisted", default: false, null: false
    t.index ["admin"], name: "index_users_on_admin"
    t.index ["is_blacklisted"], name: "index_users_on_is_blacklisted"
    t.index ["is_suspicious"], name: "index_users_on_is_suspicious"
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bicycle_images", "bicycles"
  add_foreign_key "bicycle_models", "brands"
  add_foreign_key "bicycle_models", "transmissions"
  add_foreign_key "bicycles", "bicycle_models"
  add_foreign_key "bicycles", "brands"
  add_foreign_key "bicycles", "transmissions"
  add_foreign_key "bicycles", "users"
  add_foreign_key "components", "bicycle_models", column: "bicycle_models_id"
  add_foreign_key "components", "components"
  add_foreign_key "csp_violation_reports", "users"
  add_foreign_key "messages", "bicycles"
  add_foreign_key "order_payments", "orders"
  add_foreign_key "orders", "bicycles"
  add_foreign_key "orders", "users"
  add_foreign_key "refresh_tokens", "users"
  add_foreign_key "transmissions", "bicycle_models", column: "bicycle_models_id"
  add_foreign_key "transmissions", "components"
end
