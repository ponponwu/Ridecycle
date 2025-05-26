# 載入 brands
puts "Importing brands..."
brands_data = YAML.load_file(Rails.root.join('db', 'data', 'brands.yml'))

brands_data.each do |data|
  Brand.find_or_create_by!(name: data['name'])
  puts "Created or found Brand: #{data['name']}"
end
