class ChangeBrandAndTransmissionToOptionalInBicycles < ActiveRecord::Migration[7.1]
  def change
    change_column_null :bicycles, :brand_id, true
    change_column_null :bicycles, :transmission_id, true
  end
end
