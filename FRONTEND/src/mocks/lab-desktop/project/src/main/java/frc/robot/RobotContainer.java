package frc.robot;

import com.pathplanner.lib.auto.NamedCommands;
import com.pathplanner.lib.commands.PathPlannerAuto;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.Commands;
import frc.robot.subsystems.Elevator;
import frc.robot.subsystems.Intake;

public class RobotContainer {
  private final Elevator elevator = new Elevator();
  private final Intake intake = new Intake();

  public RobotContainer() {
    // TODO 1: register the command PathPlanner calls "runIntake" so autos can run it by name.
    configureBindings();
  }

  private void configureBindings() {
    // TODO: bind a button to elevator.setSetpoint(1.0)
  }

  public Command getAutonomousCommand() {
    // TODO 2: return the PathPlanner auto named "Score Auto".
    return Commands.none();
  }
}
