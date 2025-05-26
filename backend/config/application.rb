require_relative "boot"
require "active_storage/engine"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Backend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w(assets tasks))

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # Add back middleware needed for HttpOnly cookies and CSRF protection
    # ActionDispatch::Cookies is required to read and write cookies.
    config.middleware.use ActionDispatch::Cookies

    # ActionDispatch::Session::CookieStore is required for Rails' default CSRF protection,
    # as `protect_from_forgery` relies on the session.
    # Replace '_your_app_session_key' with a suitable session key for your application.
    config.middleware.use ActionDispatch::Session::CookieStore, key: '_ride_cycle_session', same_site: :lax, secure: Rails.env.production?
    
    # If you encounter issues with middleware order, you might need to use insert_before or insert_after.
    # For example, to ensure session is available before ActionDispatch::Flash (if you were to use it):
    # config.middleware.insert_before ActionDispatch::Flash, ActionDispatch::Session::CookieStore
    # However, for Cookies and Session::CookieStore with api_only = true, simply using `use`
    # after api_only should generally place them correctly in the stack for API purposes.
  end
end
