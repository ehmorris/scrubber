set :css_dir, 'stylesheets'
set :js_dir, 'javascripts'

configure :build do
  activate :minify_css
  activate :minify_javascript
end
