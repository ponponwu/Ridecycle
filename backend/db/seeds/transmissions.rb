# Create Transmissions
puts "Creating Transmissions..."

transmission_data = YAML.load_file(Rails.root.join('db', 'data', 'transmissions.yml'))


transmission_data.each do |data|
  Transmission.find_or_create_by!(name: data['name'])
  puts "Created or found transmission: #{data['name']}"
end

puts "Transmissions creation complete!" 
