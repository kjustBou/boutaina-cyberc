export function applyVehicleTransform(vehicleModel, vehicleState, suspension) {
  vehicleModel.position.x = vehicleState.position.x;
  vehicleModel.position.z = vehicleState.position.z;
  vehicleModel.position.y = suspension ? suspension.bobY : 0;
  vehicleModel.rotation.y = vehicleState.heading;
  vehicleModel.rotation.x = suspension ? suspension.pitch : 0;
}
