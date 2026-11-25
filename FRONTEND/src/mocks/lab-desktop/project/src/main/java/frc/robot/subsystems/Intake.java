package frc.robot.subsystems;

import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;
import edu.wpi.first.wpilibj2.command.SubsystemBase;

public class Intake extends SubsystemBase {
  private boolean running = false;

  @Override
  public void periodic() {
    SmartDashboard.putBoolean("Intake Running", running);
  }

  /** Spins the intake for one second, then stops. */
  public Command runIntakeCommand() {
    return Commands.startEnd(() -> running = true, () -> running = false, this).withTimeout(1.0);
  }
}
