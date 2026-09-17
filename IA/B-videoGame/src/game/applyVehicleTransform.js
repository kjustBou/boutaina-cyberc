export function applyVehicleTransform(vehicleModel, vehicleState) {
  vehicleModel.position.x = vehicleState.position.x;
  vehicleModel.position.z = vehicleState.position.z;
  vehicleModel.rotation.y = vehicleState.heading;
}
