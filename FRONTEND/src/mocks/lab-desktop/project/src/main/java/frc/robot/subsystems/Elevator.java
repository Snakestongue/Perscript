package frc.robot.subsystems;

import com.ctre.phoenix6.hardware.TalonFX;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.SubsystemBase;
import frc.robot.Constants.ElevatorConstants;

public class Elevator extends SubsystemBase {
  private final TalonFX motor = new TalonFX(ElevatorConstants.kMotorId);
  private final PIDController pid = new PIDController(ElevatorConstants.kP, 0.0, ElevatorConstants.kD);
  private double setpointMeters = 0.2;

  public double getHeightMeters() {
    return motor.getPosition().getValueAsDouble() * ElevatorConstants.kMetersPerRotation;
  }

  public void setSetpoint(double meters) {
    setpointMeters = meters;
  }

  @Override
  public void periodic() {
    motor.setVoltage(pid.calculate(getHeightMeters(), setpointMeters));
    // TODO: publish the height so it shows up in the Elastic dashboard
  }
}
