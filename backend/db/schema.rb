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

ActiveRecord::Schema[7.1].define(version: 2025_05_08_043749) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "bicycle_images", force: :cascade do |t|
    t.bigint "bicycle_id", null: false
    t.string "image_url"
    t.integer "position"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bicycle_id"], name: "index_bicycle_images_on_bicycle_id"
  end

  create_table "bicycles", force: :cascade do |t|
    t.string "title"
    t.text "description"
    t.decimal "price"
    t.string "condition"
    t.string "brand"
    t.string "model"
    t.integer "year"
    t.string "frame_size"
    t.string "location"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_bicycles_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.integer "sender_id"
    t.integer "recipient_id"
    t.text "content"
    t.bigint "bicycle_id", null: false
    t.boolean "is_read"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["bicycle_id"], name: "index_messages_on_bicycle_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "name"
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "bicycle_images", "bicycles"
  add_foreign_key "bicycles", "users"
  add_foreign_key "messages", "bicycles"
end
