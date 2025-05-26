
Dir[Rails.root.join('db/seeds/*.rb')].sort.each do |file|
  puts "Loading seed file: #{file}"
  require file
end


# 載入 bicycle_models
# puts "Importing bicycle models..."
# bicycle_models_data = YAML.load_file(Rails.root.join('db', 'data', 'bicycle_models.yml'))

# bicycle_models_data.each do |model_data|
#   # 處理外鍵關聯
#   brand = Brand.find_by(name: model_data[:brand_name])
#   component = Component.find_by(name: model_data[:component_name])
  
#   if brand && component
#     # 移除 hash 中不直接對應欄位的鍵
#     model_data = model_data.except(:brand_name, :component_name)
    
#     # 添加外鍵 ID
#     model_data[:brand_id] = brand.id
#     model_data[:component_id] = component.id
    
#     # 檢查是否存在重複的自行車模型
#     existing_model = BicycleModel.find_by(
#       name: model_data[:name],
#       year: model_data[:year],
#       brand_id: model_data[:brand_id]
#     )
    
#     if existing_model
#       puts "Skipping duplicate bicycle model: #{model_data[:name]} #{model_data[:year]}"
#     else
#       BicycleModel.create!(model_data)
#       puts "Created bicycle model: #{model_data[:name]} #{model_data[:year]}"
#     end
#   else
#     puts "Skipping bicycle model due to missing brand or component: #{model_data[:name]}"
#   end
# end