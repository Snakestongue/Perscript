import{_ as e,a as t,f as n,n as r,o as i,t as a}from"./index-BzzjltuV.js";import{n as o,r as s,t as c}from"./codeLint-PFPiKLrc.js";var l=`# Robot project\r
\r
A small WPILib command-based project for practice.\r
\r
- Edit the Java files in \`src/main/java/frc/robot/\`.\r
- Run \`./gradlew build\` in the terminal to compile.\r
- Run \`./gradlew deploy\` to send the code to the (simulated) robot.\r
\r
Your goal: make the elevator's height show up in the Elastic dashboard.\r
Open \`subsystems/Elevator.java\` and find the TODO.\r
`,u=`plugins {\r
    id "java"\r
    id "edu.wpi.first.GradleRIO" version "2026.2.2"\r
}\r
\r
java {\r
    sourceCompatibility = JavaVersion.VERSION_17\r
    targetCompatibility = JavaVersion.VERSION_17\r
}\r
\r
def ROBOT_MAIN_CLASS = "frc.robot.Main"\r
\r
deploy {\r
    targets {\r
        roborio(getTargetTypeClass('RoboRIO')) {\r
            team = project.frc.getTeamOrDefault(0)\r
            debug = project.frc.getDebugOrDefault(false)\r
\r
            artifacts {\r
                frcJava(getArtifactTypeClass('FRCJavaArtifact')) {\r
                }\r
            }\r
        }\r
    }\r
}\r
\r
dependencies {\r
    implementation wpi.java.deps.wpilib()\r
    implementation wpi.java.vendor.java()\r
}\r
`,d=`{\r
  "version": "2025.0",\r
  "command": {\r
    "type": "sequential",\r
    "data": {\r
      "commands": [\r
        {\r
          "type": "path",\r
          "data": {\r
            "pathName": "Pickup"\r
          }\r
        },\r
        {\r
          "type": "wait",\r
          "data": {\r
            "waitTime": 1.0\r
          }\r
        },\r
        {\r
          "type": "named",\r
          "data": {\r
            "name": "print hello"\r
          }\r
        },\r
        {\r
          "type": "wait",\r
          "data": {\r
            "waitTime": 1.0\r
          }\r
        },\r
        {\r
          "type": "path",\r
          "data": {\r
            "pathName": "Score"\r
          }\r
        }\r
      ]\r
    }\r
  },\r
  "resetOdom": true,\r
  "folder": null,\r
  "choreoAuto": false\r
}`,f=`{\r
  "version": "2025.0",\r
  "waypoints": [\r
    {\r
      "anchor": {\r
        "x": 1.4267285779652068,\r
        "y": 1.8797673373522068\r
      },\r
      "prevControl": null,\r
      "nextControl": {\r
        "x": 3.820494796624656,\r
        "y": 1.2776543621065766\r
      },\r
      "isLocked": false,\r
      "linkedName": null\r
    },\r
    {\r
      "anchor": {\r
        "x": 7.726886294559709,\r
        "y": 0.8077125277685265\r
      },\r
      "prevControl": {\r
        "x": 5.891321406971974,\r
        "y": 0.8077125277685268\r
      },\r
      "nextControl": null,\r
      "isLocked": false,\r
      "linkedName": "game piece 1"\r
    }\r
  ],\r
  "rotationTargets": [],\r
  "constraintZones": [],\r
  "pointTowardsZones": [],\r
  "eventMarkers": [\r
    {\r
      "name": "Example Marker",\r
      "waypointRelativePos": 0.5,\r
      "endWaypointRelativePos": null,\r
      "command": {\r
        "type": "sequential",\r
        "data": {\r
          "commands": [\r
            {\r
              "type": "named",\r
              "data": {\r
                "name": "marker1"\r
              }\r
            }\r
          ]\r
        }\r
      }\r
    }\r
  ],\r
  "globalConstraints": {\r
    "maxVelocity": 3.0,\r
    "maxAcceleration": 3.0,\r
    "maxAngularVelocity": 540.0,\r
    "maxAngularAcceleration": 720.0,\r
    "nominalVoltage": 12.0,\r
    "unlimited": false\r
  },\r
  "goalEndState": {\r
    "velocity": 0,\r
    "rotation": 0.0\r
  },\r
  "reversed": false,\r
  "folder": null,\r
  "idealStartingState": {\r
    "velocity": 0,\r
    "rotation": 0.0\r
  },\r
  "useDefaultConstraints": false\r
}`,p=`{\r
  "version": "2025.0",\r
  "waypoints": [\r
    {\r
      "anchor": {\r
        "x": 7.726886294559709,\r
        "y": 0.8077125277685265\r
      },\r
      "prevControl": null,\r
      "nextControl": {\r
        "x": 7.168830366283274,\r
        "y": 1.8503959727060781\r
      },\r
      "isLocked": false,\r
      "linkedName": "game piece 1"\r
    },\r
    {\r
      "anchor": {\r
        "x": 6.052718509730401,\r
        "y": 4.156048097427144\r
      },\r
      "prevControl": {\r
        "x": 6.971451995967114,\r
        "y": 4.145839947580069\r
      },\r
      "nextControl": {\r
        "x": 4.731007100654631,\r
        "y": 4.170733779750208\r
      },\r
      "isLocked": false,\r
      "linkedName": null\r
    },\r
    {\r
      "anchor": {\r
        "x": 2.0728986001800274,\r
        "y": 2.834336688351374\r
      },\r
      "prevControl": {\r
        "x": 2.8659254456254897,\r
        "y": 1.8797673373522068\r
      },\r
      "nextControl": null,\r
      "isLocked": false,\r
      "linkedName": null\r
    }\r
  ],\r
  "rotationTargets": [],\r
  "constraintZones": [],\r
  "pointTowardsZones": [\r
    {\r
      "fieldPosition": {\r
        "x": 0.4,\r
        "y": 5.5\r
      },\r
      "rotationOffset": 0.0,\r
      "minWaypointRelativePos": 1.0,\r
      "maxWaypointRelativePos": 1.95,\r
      "name": "Point At Speaker"\r
    }\r
  ],\r
  "eventMarkers": [\r
    {\r
      "name": "Example Marker",\r
      "waypointRelativePos": 0.8,\r
      "endWaypointRelativePos": null,\r
      "command": {\r
        "type": "sequential",\r
        "data": {\r
          "commands": [\r
            {\r
              "type": "named",\r
              "data": {\r
                "name": "marker2"\r
              }\r
            }\r
          ]\r
        }\r
      }\r
    }\r
  ],\r
  "globalConstraints": {\r
    "maxVelocity": 3.0,\r
    "maxAcceleration": 3.0,\r
    "maxAngularVelocity": 540.0,\r
    "maxAngularAcceleration": 720.0,\r
    "nominalVoltage": 12.0,\r
    "unlimited": false\r
  },\r
  "goalEndState": {\r
    "velocity": 0,\r
    "rotation": 122.06194368281355\r
  },\r
  "reversed": false,\r
  "folder": null,\r
  "idealStartingState": {\r
    "velocity": 0,\r
    "rotation": 0.0\r
  },\r
  "useDefaultConstraints": false\r
}`,m=`{\r
  "robotWidth": 0.9,\r
  "robotLength": 0.9,\r
  "holonomicMode": true,\r
  "pathFolders": [],\r
  "autoFolders": [],\r
  "defaultMaxVel": 3.0,\r
  "defaultMaxAccel": 3.0,\r
  "defaultMaxAngVel": 540.0,\r
  "defaultMaxAngAccel": 720.0,\r
  "defaultNominalVoltage": 12.0,\r
  "robotMass": 74.088,\r
  "robotMOI": 6.883,\r
  "robotTrackwidth": 0.546,\r
  "driveWheelRadius": 0.048,\r
  "driveGearing": 5.143,\r
  "maxDriveSpeed": 5.45,\r
  "driveMotorType": "krakenX60",\r
  "driveCurrentLimit": 60.0,\r
  "wheelCOF": 1.2,\r
  "flModuleX": 0.273,\r
  "flModuleY": 0.273,\r
  "frModuleX": 0.273,\r
  "frModuleY": -0.273,\r
  "blModuleX": -0.273,\r
  "blModuleY": 0.273,\r
  "brModuleX": -0.273,\r
  "brModuleY": -0.273,\r
  "bumperOffsetX": 0.0,\r
  "bumperOffsetY": 0.0,\r
  "robotFeatures": []\r
}`,h=`package frc.robot;\r
\r
public final class Constants {\r
  public static final class ElevatorConstants {\r
    public static final int kMotorId = 5;\r
    public static final double kMetersPerRotation = 0.05;\r
    public static final double kP = 4.0;\r
    public static final double kD = 0.05;\r
  }\r
}\r
`,g=`package frc.robot;\r
\r
import edu.wpi.first.wpilibj.RobotBase;\r
\r
public final class Main {\r
  private Main() {}\r
\r
  public static void main(String... args) {\r
    RobotBase.startRobot(Robot::new);\r
  }\r
}\r
`,_=`package frc.robot;\r
\r
import edu.wpi.first.wpilibj.TimedRobot;\r
import edu.wpi.first.wpilibj2.command.Command;\r
import edu.wpi.first.wpilibj2.command.CommandScheduler;\r
\r
public class Robot extends TimedRobot {\r
  private Command autonomousCommand;\r
  private final RobotContainer container = new RobotContainer();\r
\r
  @Override\r
  public void robotPeriodic() {\r
    CommandScheduler.getInstance().run();\r
  }\r
\r
  @Override\r
  public void autonomousInit() {\r
    autonomousCommand = container.getAutonomousCommand();\r
    if (autonomousCommand != null) {\r
      autonomousCommand.schedule();\r
    }\r
  }\r
\r
  @Override\r
  public void teleopInit() {\r
    if (autonomousCommand != null) {\r
      autonomousCommand.cancel();\r
    }\r
  }\r
}\r
`,v=`package frc.robot;\r
\r
import com.pathplanner.lib.auto.NamedCommands;\r
import com.pathplanner.lib.commands.PathPlannerAuto;\r
import edu.wpi.first.wpilibj2.command.Command;\r
import edu.wpi.first.wpilibj2.command.Commands;\r
import frc.robot.subsystems.Elevator;\r
import frc.robot.subsystems.Intake;\r
\r
public class RobotContainer {\r
  private final Elevator elevator = new Elevator();\r
  private final Intake intake = new Intake();\r
\r
  public RobotContainer() {\r
    // TODO 1: register the command PathPlanner calls "runIntake" so autos can run it by name.\r
    configureBindings();\r
  }\r
\r
  private void configureBindings() {\r
    // TODO: bind a button to elevator.setSetpoint(1.0)\r
  }\r
\r
  public Command getAutonomousCommand() {\r
    // TODO 2: return the PathPlanner auto named "Score Auto".\r
    return Commands.none();\r
  }\r
}\r
`,ee=`package frc.robot.subsystems;\r
\r
import com.ctre.phoenix6.hardware.TalonFX;\r
import edu.wpi.first.math.controller.PIDController;\r
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;\r
import edu.wpi.first.wpilibj2.command.SubsystemBase;\r
import frc.robot.Constants.ElevatorConstants;\r
\r
public class Elevator extends SubsystemBase {\r
  private final TalonFX motor = new TalonFX(ElevatorConstants.kMotorId);\r
  private final PIDController pid = new PIDController(ElevatorConstants.kP, 0.0, ElevatorConstants.kD);\r
  private double setpointMeters = 0.2;\r
\r
  public double getHeightMeters() {\r
    return motor.getPosition().getValueAsDouble() * ElevatorConstants.kMetersPerRotation;\r
  }\r
\r
  public void setSetpoint(double meters) {\r
    setpointMeters = meters;\r
  }\r
\r
  @Override\r
  public void periodic() {\r
    motor.setVoltage(pid.calculate(getHeightMeters(), setpointMeters));\r
    // TODO: publish the height so it shows up in the Elastic dashboard\r
  }\r
}\r
`,y=`package frc.robot.subsystems;\r
\r
import edu.wpi.first.wpilibj.smartdashboard.SmartDashboard;\r
import edu.wpi.first.wpilibj2.command.Command;\r
import edu.wpi.first.wpilibj2.command.Commands;\r
import edu.wpi.first.wpilibj2.command.SubsystemBase;\r
\r
public class Intake extends SubsystemBase {\r
  private boolean running = false;\r
\r
  @Override\r
  public void periodic() {\r
    SmartDashboard.putBoolean("Intake Running", running);\r
  }\r
\r
  /** Spins the intake for one second, then stops. */\r
  public Command runIntakeCommand() {\r
    return Commands.startEnd(() -> running = true, () -> running = false, this).withTimeout(1.0);\r
  }\r
}\r
`,b=e(n(),1),te=`roboRIO-0000-FRC.local`,x=[`Practice terminal commands:`,`  ./gradlew build         compile the project`,`  ./gradlew deploy        build and send the code to the (simulated) robot`,`  ./gradlew clean         delete build output`,`  ./gradlew tasks         list tasks`,`  ls   pwd   clear   help`];function S(e,t,n=`out`){return{ms:e,text:t,kind:n}}function C(e){let t=[];for(let[n,r]of Object.entries(e))if(n.endsWith(`.java`))for(let e of o(r,`java`))t.push({path:n,line:e.startLineNumber,message:e.message});return t}function w(e){let t={Number:`double`,Boolean:`boolean`,String:`string`},n=new Map;for(let[r,i]of Object.entries(e)){if(!r.endsWith(`.java`))continue;let e=i.replace(/\/\*[\s\S]*?\*\//g,``).replace(/\/\/[^\n]*/g,``);for(let r of e.matchAll(/SmartDashboard\s*\.\s*put(Number|Boolean|String)\s*\(\s*"([^"]+)"/g))n.set(r[2],t[r[1]])}return[...n].map(([e,t])=>({name:`/SmartDashboard/${e}`,type:t}))}function T(e){let t=C(e),n=[S(250,`> Task :compileJava`)];if(t.length){for(let e of t.slice(0,6))n.push(S(120,`${e.path.split(`/`).pop()}:${e.line}: error: ${e.message}`,`err`));return t.length>6&&n.push(S(60,`... ${t.length-6} more error(s)`,`err`)),n.push(S(150,``),S(100,`> Task :compileJava FAILED`,`err`),S(150,``)),n.push(S(100,`FAILURE: Build failed with an exception.`,`err`),S(80,``)),n.push(S(80,`* What went wrong:`,`err`),S(80,`Execution failed for task ':compileJava'.`,`err`)),n.push(S(80,`> Compilation failed; ${t.length} error(s). See the errors above.`,`err`),S(150,``)),n.push(S(100,`BUILD FAILED in ${2+t.length}s`,`err`)),{steps:n,ok:!1}}return n.push(S(500,`> Task :processResources`),S(180,`> Task :classes`),S(300,`> Task :jar`)),{steps:n,ok:!0}}function ne(e,t){let n=e.trim().replace(/^\.\//,``).replace(/^\.\\/,``);if(!n)return{steps:[]};if(n===`clear`)return{steps:[],clear:!0};if(n===`help`)return{steps:x.map(e=>S(20,e,`dim`))};if(n===`pwd`)return{steps:[S(20,`/home/student/robot`)]};if(n===`ls`)return{steps:[S(20,`build.gradle  README.md  src`)]};let r=n.match(/^gradlew(?:\.bat)?\s*(.*)$/);if(!r)return{steps:[S(20,`bash: ${n.split(/\s+/)[0]}: command not found`,`err`)]};let i=r[1].trim().split(/\s+/)[0]||`tasks`;if(i===`clean`)return{steps:[S(300,`> Task :clean`),S(150,``),S(60,`BUILD SUCCESSFUL in 1s`,`ok`)]};if(i===`tasks`)return{steps:[`Application tasks`,`-----------------`,`simulateJava - Simulate the robot (not available here)`,``,`Build tasks`,`-----------`,`build - Assembles and tests this project`,`clean - Deletes the build directory`,``,`Deploy tasks`,`------------`,`deploy - Deploys the robot code to the roboRIO`].map(e=>S(25,e,`dim`))};if(i===`simulateJava`)return{steps:[S(200,`Simulation is not available in this practice environment. Use deploy.`,`err`)]};if(i!==`build`&&i!==`deploy`)return{steps:[S(100,`FAILURE: Task '${i}' not found in root project 'robot'.`,`err`)]};let a=T(t);if(!a.ok)return{steps:a.steps,result:{type:i,ok:!1}};let o=[...a.steps];if(i===`build`)return o.push(S(250,`> Task :build`),S(120,``),S(80,`BUILD SUCCESSFUL in 6s`,`ok`),S(40,`4 actionable tasks: 4 executed`,`dim`)),{steps:o,result:{type:`build`,ok:!0}};let s=w(t);return o.push(S(300,`> Task :discoverroborio`),S(500,`Searching for roboRIO at ${te} ...`,`dim`),S(400,`Found roboRIO at 10.0.0.2`,`dim`),S(250,`> Task :deployfrcJava`),S(500,`Deploying frcJava to roborio`,`dim`),S(600,`  uploading frcUserProgram.jar`,`dim`),S(500,`  restarting robot code`,`dim`),S(700,`Deploy Success!`,`ok`),S(150,`> Task :deploy`),S(120,``),S(80,`BUILD SUCCESSFUL in 11s`,`ok`),S(40,`6 actionable tasks: 6 executed`,`dim`)),{steps:o,result:{type:`deploy`,ok:!0,topics:s,at:Date.now()}}}var E=t(),D={out:`text-[#cccccc]`,dim:`text-[#8b8b8b]`,err:`text-[#f14c4c]`,ok:`text-[#23d18b]`,cmd:`text-[#e5e5e5]`},re={build:`./gradlew build`,deploy:`./gradlew deploy`},ie=e=>e.endsWith(`.java`)?`java`:e.endsWith(`.json`)||e.endsWith(`.path`)||e.endsWith(`.auto`)?`json`:e.endsWith(`.md`)?`markdown`:e.endsWith(`.gradle`)?`java`:`plaintext`;function O(e){let t={name:``,path:``,children:[]};for(let n of e.slice().sort()){let e=n.split(`/`),r=t;e.forEach((t,n)=>{let i=e.slice(0,n+1).join(`/`),a=r.children.find(e=>e.name===t);a||(a={name:t,path:i,children:n<e.length-1?[]:null},r.children.push(a)),r=a})}let n=e=>{e.children&&(e.children.sort((e,t)=>!!t.children-!!e.children||e.name.localeCompare(t.name)),e.children.forEach(n))};return n(t),t.children}function ae({size:e=18}){return(0,E.jsxs)(`svg`,{width:e,height:e,viewBox:`0 0 24 24`,"aria-hidden":`true`,children:[(0,E.jsx)(`path`,{d:`M12 1.5 21.2 6.8v10.4L12 22.5 2.8 17.2V6.8z`,fill:`#c8102e`}),(0,E.jsx)(`path`,{d:`m7 8 1.7 8 3.3-5.2 3.3 5.2L17 8`,fill:`none`,stroke:`#fff`,strokeWidth:`1.8`,strokeLinecap:`round`,strokeLinejoin:`round`})]})}function oe({nodes:e,depth:t,open:n,toggle:r,active:i,onOpen:a,editable:o,lessonFile:s}){return e.map(e=>(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>e.children?r(e.path):a(e.path),className:`
          flex w-full items-center gap-1 truncate py-[2px] text-left text-[13px] 
          cursor-pointer hover:bg-[rgb(20_20_20)] transition-all duration-200
           ${i===e.path?`bg-[#37373d] text-white`:`text-[#cccccc]`}`,style:{paddingLeft:8+t*12},children:[(0,E.jsx)(`span`,{className:`w-3 text-[10px] text-[#8b8b8b]`,children:e.children?n.has(e.path)?`▾`:`▸`:``}),(0,E.jsx)(`span`,{className:`truncate`,children:e.name}),!e.children&&e.path===s&&(0,E.jsx)(`span`,{className:`ml-auto mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#23d18b]`,title:`This lesson's file`}),!e.children&&!o(e.path)&&(0,E.jsx)(`span`,{className:`ml-auto mr-2 shrink-0 text-[10px] text-[#6b6b6b]`,title:`Read-only in this lesson`,children:`🔒`})]}),e.children&&n.has(e.path)&&(0,E.jsx)(oe,{nodes:e.children,depth:t+1,open:n,toggle:r,active:i,onOpen:a,editable:o,lessonFile:s})]},e.path))}function se({lines:e,busy:t}){let n=(0,b.useRef)(null);return(0,b.useEffect)(()=>{n.current?.scrollIntoView({block:`end`})},[e]),(0,E.jsxs)(`div`,{className:`flex h-full min-h-0 flex-col !bg-black font-mono text-[12px]`,children:[(0,E.jsxs)(`div`,{className:`flex shrink-0 items-center gap-3 border-b border-[#2b2b2b] px-3 py-1 text-[11px] uppercase tracking-wide text-[#8b8b8b]`,children:[(0,E.jsx)(`span`,{className:`border-b border-[#e5e5e5] pb-[2px] text-[#e5e5e5]`,children:`Terminal`}),t&&(0,E.jsx)(`span`,{className:`normal-case text-[#cca700]`,children:`● Running…`})]}),(0,E.jsxs)(`div`,{className:`min-h-0 flex-1 select-text overflow-auto px-3 py-1`,"aria-label":`Terminal output`,role:`log`,children:[e.map((e,t)=>(0,E.jsx)(`div`,{className:`whitespace-pre-wrap ${D[e.kind]||D.out}`,children:e.text||`\xA0`},t)),(0,E.jsx)(`div`,{ref:n})]})]})}function k({files:e,setFile:t,resetProject:n,onDeploy:i,onResult:o,onOpenFile:l,onCursor:u,editable:d=()=>!0,lessonFile:f=null,deployEnabled:p=!0,deployBlockedReason:m=``,scale:h=1}){let g=(0,b.useMemo)(()=>Object.keys(e),[e]),_=(0,b.useMemo)(()=>O(g),[g]),v=f??g[0],[ee,y]=(0,b.useState)(()=>new Set([`src`,`src/main`,`src/main/java`,`src/main/java/frc`,`src/main/java/frc/robot`,`src/main/java/frc/robot/subsystems`])),[te,x]=(0,b.useState)([v]),[S,C]=(0,b.useState)(v),[w,T]=(0,b.useState)({line:1,col:1}),[D,k]=(0,b.useState)(!1),[A,j]=(0,b.useState)([{text:`Click the WPILib icon (top right of the editor) to build or deploy your robot code.`,kind:`dim`}]),[M,N]=(0,b.useState)(!1),[P,ce]=(0,b.useState)(``),le=(0,b.useRef)([]),F=(0,b.useRef)(null),ue=(0,b.useRef)(null),I=(0,b.useRef)(e);(0,b.useEffect)(()=>{I.current=e},[e]);let L=(0,b.useCallback)(e=>{ce(e),clearTimeout(F.current),F.current=setTimeout(()=>ce(``),3500)},[]);(0,b.useEffect)(()=>()=>{le.current.forEach(clearTimeout),clearTimeout(F.current)},[]),(0,b.useEffect)(()=>{l?.(S)},[S,l]),(0,b.useEffect)(()=>{u?.(S,w.line)},[S,w.line,u]);let R=e=>y(t=>{let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n}),z=e=>{x(t=>t.includes(e)?t:[...t,e]),C(e)},B=e=>{if(e===f){L(`Keep this file open: it is the one for this lesson.`);return}x(t=>{let n=t.filter(t=>t!==e);return S===e&&C(n[n.length-1]??f??null),n})},V=(0,b.useCallback)(e=>{if(M)return;if(e===`deploy`&&!p){L(m||`Finish the earlier steps before deploying.`);return}let t=re[e],n=ne(t,I.current);N(!0),j([{text:` *  Executing task: ${t}`,kind:`cmd`},{text:``,kind:`out`}]);let r=0;n.steps.forEach(e=>{r+=e.ms,le.current.push(setTimeout(()=>j(t=>[...t,{text:e.text,kind:e.kind}]),r))}),le.current.push(setTimeout(()=>{N(!1),n.result&&o?.(n.result),n.result?.type===`deploy`&&n.result.ok&&i(n.result)},r+50))},[M,p,m,i,o,L]),de=e=>{e.shiftKey&&e.key===`F5`&&(e.preventDefault(),V(`deploy`)),e.key===`Escape`&&k(!1)},H=S?d(S):!1,U={zoom:h};return(0,E.jsxs)(`div`,{ref:ue,className:`relative flex h-full min-h-0 flex-col !bg-black text-[#cccccc] text-[14px]`,onKeyDown:de,tabIndex:-1,children:[(0,E.jsxs)(`div`,{className:`flex min-h-0 flex-1`,children:[(0,E.jsxs)(`aside`,{className:`flex w-48 shrink-0 flex-col border-r border-[#2b2b2b] !bg-black`,style:U,children:[(0,E.jsxs)(`div`,{className:`flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wide text-[#bbbbbb]`,children:[(0,E.jsx)(`span`,{children:`Explorer`}),(0,E.jsx)(`button`,{type:`button`,className:`\r
            rounded px-1 text-[10px] normal-case text-[#8b8b8b] hover:bg-[#37373d] hover:text-white cursor-pointer duration-300`,onClick:n,title:`Restore the starting files`,children:`Reset`})]}),(0,E.jsx)(`div`,{className:`px-3 pb-1 text-[11px] font-semibold uppercase text-[#bbbbbb]`,children:`robot`}),(0,E.jsx)(`div`,{className:`min-h-0 flex-1 overflow-auto pb-2`,children:(0,E.jsx)(oe,{nodes:_,depth:0,open:ee,toggle:R,active:S,onOpen:z,editable:d,lessonFile:f})})]}),(0,E.jsxs)(`div`,{className:`flex min-w-0 flex-1 flex-col`,children:[(0,E.jsxs)(`div`,{className:`flex shrink-0 items-stretch bg-black`,style:U,children:[(0,E.jsx)(`div`,{className:`flex min-w-0 flex-1 overflow-x-auto`,role:`tablist`,children:te.map(e=>(0,E.jsxs)(`div`,{role:`tab`,"aria-selected":e===S,className:`group flex shrink-0 items-center gap-2 
                border-r border-none !bg-black px-3 py-1.5 text-[12px] ${e===S?`!bg-black text-white`:`bg-[#2d2d2d] text-[#9d9d9d]`}`,children:[(0,E.jsxs)(`button`,{type:`button`,onClick:()=>C(e),children:[e.split(`/`).pop(),d(e)?``:` 🔒`]}),(0,E.jsx)(`button`,{type:`button`,"aria-label":`Close ${e.split(`/`).pop()}`,className:`rounded px-1 text-[#8b8b8b] hover:bg-[#444] hover:text-white`,onClick:()=>B(e),children:`×`})]},e))}),(0,E.jsxs)(`div`,{className:`relative flex shrink-0 items-center px-2 `,children:[(0,E.jsx)(`button`,{type:`button`,onClick:()=>k(e=>!e),"aria-haspopup":`menu`,"aria-expanded":D,"aria-label":`WPILib commands`,title:`WPILib commands (Shift+F5 deploys)`,className:`!cursor-pointer grid h-7 w-7 place-items-center rounded hover:bg-[#37373d] ${D?`bg-[#37373d]`:``}`,children:(0,E.jsx)(ae,{})}),D&&(0,E.jsxs)(`div`,{role:`menu`,className:`absolute right-1 top-full z-20 mt-1 w-64 overflow-hidden rounded border border-[#454545] bg-black py-1 text-[12px] shadow-xl`,children:[(0,E.jsx)(`div`,{className:`px-3 py-1 text-[10px] uppercase tracking-wide text-[#8b8b8b]`,children:`WPILib`}),(0,E.jsx)(`button`,{role:`menuitem`,type:`button`,disabled:M,className:`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#04395e] disabled:opacity-50 !cursor-pointer`,onClick:()=>{k(!1),V(`build`)},children:(0,E.jsx)(`span`,{children:`Build Robot Code`})}),(0,E.jsxs)(`button`,{role:`menuitem`,type:`button`,disabled:M,className:`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-[#04395e] disabled:opacity-50 !cursor-pointer ${p?``:`text-[#6b6b6b]`}`,onClick:()=>{k(!1),V(`deploy`)},children:[(0,E.jsx)(`span`,{children:`Deploy Robot Code`}),(0,E.jsx)(`span`,{className:`text-[10px] text-[#8b8b8b]`,children:`⇧F5`})]}),(0,E.jsxs)(`button`,{role:`menuitem`,type:`button`,disabled:!0,className:`flex w-full items-center justify-between px-3 py-1.5 text-left text-[#6b6b6b] !cursor-pointer`,children:[(0,E.jsx)(`span`,{children:`Simulate Robot Code`}),(0,E.jsx)(`span`,{className:`text-[10px]`,children:`not here`})]})]})]})]}),(0,E.jsx)(`div`,{className:`min-h-0 flex-1`,children:S?(0,E.jsx)(s,{height:`100%`,path:S,language:ie(S),value:e[S],onChange:e=>{H&&t(S,e??``)},onMount:(e,t)=>{t.editor.defineTheme(`vscode-black`,{base:`vs-dark`,inherit:!0,rules:[],colors:{"editor.background":`#000000`,"editorGutter.background":`#000000`,"editorLineNumber.foreground":`#858585`,"editorLineNumber.activeForeground":`#ffffff`,"editorWidget.background":`#000000`,"editorSuggestWidget.background":`#000000`,"editorHoverWidget.background":`#000000`,"editor.lineHighlightBackground":`#111111`}}),t.editor.setTheme(`vscode-black`),r(t),a(e,{monaco:t,extraTypes:()=>new Set(Object.keys(I.current).filter(e=>e.endsWith(`.java`)).map(e=>e.split(`/`).pop().replace(`.java`,``)))}),c(t,e),e.onDidChangeCursorPosition(e=>T({line:e.position.lineNumber,col:e.position.column})),e.onDidAttemptReadOnlyEdit(()=>L(`This file is read-only in this lesson. Work in the file marked with the green dot.`))},options:{readOnly:!H,readOnlyMessage:{value:`Read-only in this lesson.`},minimap:{enabled:!1},fontSize:Math.round(13*h),automaticLayout:!0,fixedOverflowWidgets:!0,scrollBeyondLastLine:!1,parameterHints:{enabled:!0,cycle:!0},hover:{enabled:!0,delay:250,sticky:!0},suggest:{showStatusBar:!0}}}):(0,E.jsx)(`div`,{className:`grid h-full place-content-center text-sm text-[#8b8b8b]`,children:`Open a file from the explorer`})}),(0,E.jsx)(`div`,{className:`h-[34%] min-h-[7rem] shrink-0 border-t border-[#2b2b2b]`,style:U,children:(0,E.jsx)(se,{lines:A,busy:M})})]})]}),(0,E.jsxs)(`div`,{className:`flex shrink-0 items-center justify-between bg-[#007acc] px-3 py-0.5 text-[11px] text-white`,style:U,children:[(0,E.jsx)(`span`,{children:`⎇ main`}),(0,E.jsx)(`span`,{children:S?`${H?``:`Read-only   `}Ln ${w.line}, Col ${w.col}   ${ie(S)===`java`?`Java`:ie(S)}`:``})]}),P&&(0,E.jsx)(`div`,{role:`status`,className:`pointer-events-none absolute bottom-12 left-1/2 z-30 max-w-[85%] -translate-x-1/2 rounded bg-[#3c3c3c] px-3 py-1.5 text-center text-[12px] text-white shadow-lg`,children:P})]})}var A=24;function j(e){try{return JSON.parse(e)}catch{return null}}function M(e,t,n){let r=e.anchor,i=e.nextControl||e.anchor,a=t.prevControl||t.anchor,o=t.anchor,s=1-n;return[s*s*s*r.x+3*s*s*n*i.x+3*s*n*n*a.x+n*n*n*o.x,s*s*s*r.y+3*s*s*n*i.y+3*s*n*n*a.y+n*n*n*o.y]}function N(e){let t=[],n=e=>{if(!(!e||typeof e!=`object`)){e.type===`named`&&e.data?.name&&t.push(e.data.name);for(let t of e.data?.commands||[])n(t);e.command&&n(e.command)}};return n(e),t}function P(e){let t=[],n=e=>{if(!(!e||typeof e!=`object`)){e.type===`path`&&e.data?.pathName&&t.push(e.data.pathName);for(let t of e.data?.commands||[])n(t)}};return n(e),t}function ce(e,t){let n=j(t.autos?.[e]??``);if(!n)return null;let r=[],i=e=>{if(!(!e||typeof e!=`object`)){if(e.type===`path`&&e.data?.pathName){let n=j(t.paths?.[e.data.pathName]??``);if(!n?.waypoints?.length)return;let i=n.waypoints,a=(n.eventMarkers||[]).flatMap(e=>N(e.command).map(t=>({at:Number(e.waypointRelativePos)||0,name:t}))),o=[];for(let e=0;e<i.length-1;e++)for(let t=0;t<A;t++)o.push({kind:`point`,pos:e+t/A,xy:M(i[e],i[e+1],t/A)});o.push({kind:`point`,pos:i.length-1,xy:[i[i.length-1].anchor.x,i[i.length-1].anchor.y]});let s=[],c=[...a].sort((e,t)=>e.at-t.at);for(let e of o){for(;c.length&&c[0].at<=e.pos;)s.push({kind:`command`,name:c.shift().name});s.push({kind:`point`,x:e.xy[0],y:e.xy[1]})}for(let e of c)s.push({kind:`command`,name:e.name});r.push(...s)}else e.type===`named`&&e.data?.name&&r.push({kind:`command`,name:e.data.name});for(let t of e.data?.commands||[])i(t);e.command&&i(e.command)}};return i(n.command??n),r}function le(e){let t={};for(let[n,r]of Object.entries(e.autos||{})){let i=j(r);i&&(t[n]={paths:P(i.command??i),commands:[...new Set([...N(i.command??i),...P(i.command??i).flatMap(t=>(j(e.paths?.[t]??``)?.eventMarkers||[]).flatMap(e=>N(e.command)))])]})}return{autos:t,paths:Object.keys(e.paths||{})}}function F(e){let t=new Set;for(let[n,r]of Object.entries(e)){if(!n.endsWith(`.java`))continue;let e=r.replace(/\/\*[\s\S]*?\*\//g,``).replace(/\/\/[^\n]*/g,``);for(let n of e.matchAll(/NamedCommands\s*\.\s*registerCommand\s*\(\s*"([^"]+)"/g))t.add(n[1])}return[...t]}function ue(e){let t=new Set;for(let[n,r]of Object.entries(e)){if(!n.endsWith(`.java`))continue;let e=r.replace(/\/\*[\s\S]*?\*\//g,``).replace(/\/\/[^\n]*/g,``);for(let n of e.matchAll(/new\s+PathPlannerAuto\s*\(\s*"([^"]+)"/g))t.add(n[1]);for(let n of e.matchAll(/AutoBuilder\s*\.\s*buildAuto\s*\(\s*"([^"]+)"/g))t.add(n[1])}return[...t]}var I=`src/main/java/frc/robot/subsystems/Elevator.java`,L=`/SmartDashboard/Elevator Height`,R=[{id:`open`,title:`Find the TODO`,body:`In VS Code, Elevator.java is open. Find the TODO comment inside periodic().`,hint:`It is the last line of the periodic() method: “publish the height so it shows up in the Elastic dashboard”.`,done:e=>e.openedLessonFile&&e.todoVisited},{id:`publish`,title:`Publish the height`,body:`Replace the TODO with a line that sends the elevator height to the dashboard under the name “Elevator Height”.`,hint:`SmartDashboard.putNumber("Elevator Height", getHeightMeters());`,done:e=>e.publishedTopics.includes(L)},{id:`deploy`,title:`Deploy to the robot`,body:`Click the WPILib icon at the top right of the editor and choose Deploy Robot Code (or press Shift+F5). Wait for BUILD SUCCESSFUL.`,hint:`If the build fails, read the error in the terminal. It names the file and the line.`,done:e=>e.deployedTopics.includes(L)},{id:`dashboard`,title:`Find it in Elastic`,body:`Open Elastic from the taskbar. Click Add Widget, expand SmartDashboard, and drag Elevator Height onto the grid. The lesson notices when the tile is placed.`,hint:`If Elevator Height is missing from the list, deploy again. The dashboard only shows what the deployed code publishes.`,done:e=>e.placedTopics.includes(L)}],z=`Score Auto`,B=`runIntake`,V=`src/main/java/frc/robot/RobotContainer.java`,de=[{id:`auto`,title:`Create the auto`,body:`In PathPlanner, create a new auto named “${z}” and add the Pickup path to it.`,hint:`Open the Autos tab, press the + button, rename the auto to ${z}, then use Add Path and pick Pickup. The name must match exactly, including the capital letters.`,done:e=>e.auto2.hasAuto},{id:`command`,title:`Add a named command`,body:`Add a Named Command called “${B}” to ${z}, after the path.`,hint:`In the auto, use Add Named Command and type ${B}. PathPlanner only stores the name. The robot code has to supply what it does.`,done:e=>e.auto2.hasCommand},{id:`register`,title:`Register it in Java`,body:`In RobotContainer.java, replace TODO 1 with a line that registers “${B}” so the auto can find it.`,hint:`NamedCommands.registerCommand("${B}", intake.runIntakeCommand());`,done:e=>e.registered.includes(B)},{id:`return`,title:`Return the auto`,body:`Replace TODO 2 so getAutonomousCommand() returns the PathPlanner auto named “${z}”.`,hint:`return new PathPlannerAuto("${z}");`,done:e=>e.autoRefs.includes(z)},{id:`deploy`,title:`Deploy`,body:`Deploy the robot code from the WPILib menu in VS Code (or press Shift+F5).`,hint:`If the robot console warns about a missing auto or command, the names do not match. Compare them letter by letter.`,done:e=>e.deployedAuto===`Score Auto`&&e.deployedRegistered.includes(`runIntake`)},{id:`run`,title:`Run it`,body:`In the Driver Station window, choose Autonomous and press Enable. Watch the robot drive and the command fire.`,hint:`Add the Field widget in Elastic to watch the robot move. Intake Running turns on when the command runs.`,done:e=>e.commandRuns.includes(B)}],H=[{id:`l1`,title:`Lesson 1: Publish a value`,file:I,steps:R,apps:[`code`,`elastic`]},{id:`l2`,title:`Lesson 2: Your first auto`,file:V,steps:de,apps:[`code`,`elastic`,`pathplanner`,`ds`]}];function U({files:e,deploy:t,openedLessonFile:n,todoVisited:r,widgets:i=[],project:a={autos:{},paths:{}},commandRuns:o=[]}){let s=le(a).autos[z];return{openedLessonFile:n,todoVisited:r,widgets:i,placedTopics:i.map(e=>e.topic),publishedTopics:w(e).map(e=>e.name),deployedTopics:t?.ok?(t.topics||[]).map(e=>e.name):[],registered:F(e),autoRefs:ue(e),auto2:{hasAuto:!!s&&s.paths.includes(`Pickup`),hasCommand:!!s&&s.commands.includes(`runIntake`)},deployedAuto:t?.ok?t.autonomous?.name??null:null,deployedRegistered:t?.ok&&t.registered||[],commandRuns:o}}function fe(e,t=R){let n=t.findIndex(t=>!t.done(e));return n===-1?t.length:n}function pe({state:e,setState:t,log:n,deployed:r}){let{mode:i,enabled:a}=e;return(0,E.jsxs)(`div`,{className:`flex h-full flex-col gap-2 overflow-auto bg-[#1b1f27] p-3 text-sm text-slate-200`,children:[(0,E.jsx)(`div`,{className:`flex items-center gap-2`,role:`radiogroup`,"aria-label":`Robot mode`,children:[[`teleop`,`Teleoperated`],[`auto`,`Autonomous`]].map(([e,n])=>(0,E.jsx)(`button`,{type:`button`,role:`radio`,"aria-checked":i===e,disabled:a,onClick:()=>t({mode:e,enabled:!1}),className:`rounded border px-2 py-1 text-xs ${i===e?`border-[#7AADFF] bg-[#7AADFF]/20 text-white`:`border-zinc-600 text-slate-300 hover:bg-zinc-800`} disabled:opacity-60`,children:n},e))}),(0,E.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,E.jsx)(`button`,{type:`button`,disabled:!r||a,onClick:()=>t({mode:i,enabled:!0}),className:`rounded bg-green-700 px-3 py-1 text-xs font-semibold text-white hover:bg-green-600 disabled:opacity-40`,children:`Enable`}),(0,E.jsx)(`button`,{type:`button`,disabled:!a,onClick:()=>t({mode:i,enabled:!1}),className:`rounded bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-40`,children:`Disable`}),(0,E.jsx)(`span`,{className:`text-xs`,"aria-live":`polite`,children:a?`Enabled: ${i===`auto`?`Autonomous`:`Teleop`}`:`Disabled`})]}),!r&&(0,E.jsx)(`p`,{className:`text-xs text-amber-300`,children:`No robot code yet. Deploy first.`}),(0,E.jsx)(`div`,{className:`min-h-0 flex-1 overflow-auto rounded bg-black/50 p-2 font-mono text-[11px] leading-relaxed text-slate-300`,"aria-label":`Robot console`,role:`log`,children:n.length===0?(0,E.jsx)(`span`,{className:`text-slate-500`,children:`Robot console`}):n.map((e,t)=>(0,E.jsx)(`div`,{className:/^(ERROR|WARNING)/.test(e)?`text-amber-300`:``,children:e},t))})]})}var W=`/Perscript/`,G=Object.fromEntries(Object.entries(Object.assign({"./project/README.md":l,"./project/build.gradle":u,"./project/src/main/deploy/pathplanner/autos/Example Auto.auto":d,"./project/src/main/deploy/pathplanner/paths/Pickup.path":f,"./project/src/main/deploy/pathplanner/paths/Score.path":p,"./project/src/main/deploy/pathplanner/settings.json":m,"./project/src/main/java/frc/robot/Constants.java":h,"./project/src/main/java/frc/robot/Main.java":g,"./project/src/main/java/frc/robot/Robot.java":_,"./project/src/main/java/frc/robot/RobotContainer.java":v,"./project/src/main/java/frc/robot/subsystems/Elevator.java":ee,"./project/src/main/java/frc/robot/subsystems/Intake.java":y})).map(([e,t])=>[e.replace(`./project/`,``),t])),me=`labDesktopFiles`,he=`labRobotDeploy`,ge=`labDesktopScale`,K=40,_e=14,q={code:{w:420,h:300},elastic:{w:340,h:260},pathplanner:{w:380,h:280},ds:{w:260,h:200}},J=[.8,.9,1,1.1,1.25,1.4],ve=[{id:`code`,title:`Visual Studio Code`,icon:`⚙️`,color:`#007acc`},{id:`elastic`,title:`Elastic`,icon:`📊`,color:`#2f6fed`,src:`${W}elastic/index.html?lab=1`},{id:`pathplanner`,title:`PathPlanner`,icon:`♾️`,color:`#e8a33d`,src:`${W}pathplanner/index.html`},{id:`ds`,title:`Driver Station`,icon:`🎮`,color:`#3fb950`}],ye=(e,t)=>{try{return JSON.parse(localStorage.getItem(e))??t}catch{return t}},be=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch{}};function xe(){let e=ye(me,{});return{...G,...Object.fromEntries(Object.entries(e).filter(([e])=>e in G))}}function Se(e,t,n,r){let i=Math.max(160,r-K),a=Math.min(Math.max(t.w,q[e].w),Math.max(n,200)),o=Math.min(Math.max(t.h,q[e].h),i);return{...t,w:a,h:o,x:Math.min(Math.max(t.x,0),Math.max(0,n-a)),y:Math.min(Math.max(t.y,0),Math.max(0,i-o))}}var Y=`src/main/java/frc/robot/subsystems/Elevator.java`;function Ce(e){return(e=>Object.fromEntries([`code`,`elastic`,`pathplanner`,`ds`].map((t,n)=>[t,{open:e.includes(t),min:!1,max:!1,x:8+n*24,y:8+n*24,w:560,h:380,z:11-n}])))(e===`l2`?[`code`,`elastic`,`pathplanner`,`ds`]:[`code`])}function we(e){let t={...G};return e===`l2`&&t[Y]&&(t[Y]=t[Y].replace(/ *\/\/ TODO: publish the height.*/,`    SmartDashboard.putNumber("Elevator Height", getHeightMeters());`)),t}function Te(){try{sessionStorage.removeItem(he),sessionStorage.removeItem(`labFs`)}catch{}try{Object.keys(localStorage).filter(e=>e.startsWith(`flutter.`)).forEach(e=>localStorage.removeItem(e))}catch{}}function Ee(){let e={};try{Object.keys(localStorage).filter(e=>e.startsWith(`flutter.`)).forEach(t=>{e[t]=localStorage.getItem(t)})}catch{}return e}function De(){let[e,t]=(0,b.useState)(()=>new Date);return(0,b.useEffect)(()=>{let e=setInterval(()=>t(new Date),15e3);return()=>clearInterval(e)},[]),(0,E.jsx)(`span`,{children:e.toLocaleTimeString([],{hour:`numeric`,minute:`2-digit`})})}function Oe({lessons:e,lessonId:t,setLessonId:n,unlocked:r,steps:a,state:o,current:s,freePlay:c,toggleFreePlay:l,placed:u,picked:d,onFullscreen:f,onResetLesson:p,onResetLab:m}){let[h,g]=(0,b.useState)(null),_=h===s,v=a[s];return(0,E.jsxs)(`aside`,{className:`flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-r border-zinc-700  p-3 text-sm max-md:w-56`,"aria-label":`Lesson guide`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`text-[11px] uppercase tracking-wider text-slate-500`,children:`Robot Lab`}),(0,E.jsx)(`div`,{className:`mt-1 flex flex-col gap-1`,role:`tablist`,"aria-label":`Lessons`,children:e.map((e,i)=>{let a=i===0||r;return(0,E.jsxs)(`button`,{type:`button`,role:`tab`,"aria-selected":e.id===t,disabled:!a,title:a?e.title:`Finish lesson 1 first`,onClick:()=>n(e.id),className:`
                  lab-sub-but
                  rounded-[0.45rem] border px-2 py-1 text-left text-xs font-bold transition-colors duration-150 disabled:opacity-40 ${e.id===t?`border-[#7AADFF] bg-[#7AADFF]/20 text-white`:`border-white/[0.39] bg-transparent text-slate-300 hover:border-white/60 hover:bg-white/5`}`,children:[a?``:`🔒 `,e.title]},e.id)})})]}),(0,E.jsx)(`ol`,{className:`flex flex-col gap-1 text-xs`,children:a.map((e,t)=>{let n=e.done(o);return(0,E.jsxs)(`li`,{className:`flex items-center gap-2 rounded border px-2 py-1 ${n?`border-green-700 bg-green-900/30 text-green-300`:t===s?`border-[#7AADFF] bg-[#7AADFF]/15 text-white`:`border-zinc-700 text-zinc-500`}`,"aria-current":t===s?`step`:void 0,children:[(0,E.jsx)(`span`,{"aria-hidden":`true`,className:`w-3 text-center`,children:n?`✓`:t+1}),e.title]},e.id)})}),c?(0,E.jsx)(`p`,{className:`text-slate-300`,children:`Free play: everything is unlocked. Edit any file, open every app, and experiment.`}):v?(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`p`,{className:`text-slate-100`,children:[(0,E.jsxs)(`span`,{className:`font-semibold text-[#7AADFF]`,children:[`Step `,s+1,`:`]}),` `,v.body]}),(0,E.jsx)(`button`,{type:`button`,className:`action-buttons hint-button mt-2 !w-full !h-11 !min-h-11`,onClick:()=>g(_?null:s),children:_?`Hide hint`:`Need a hint?`}),v.id===`dashboard`&&(0,E.jsx)(`p`,{className:`mt-1 text-xs text-slate-400`,children:`Waiting for Elastic to report the tile…`}),_&&(0,E.jsx)(`p`,{className:`mt-1 whitespace-pre-wrap rounded bg-black/40 px-2 py-1 font-mono text-xs text-slate-200`,children:v.hint}),d&&(0,E.jsxs)(`p`,{className:`mt-1 text-xs text-slate-400`,children:[`Elastic reports the Auto Chooser is set to “`,d,`”.`]})]}):(0,E.jsx)(`p`,{className:`font-semibold text-green-300`,children:t===`l1`?`Lesson complete. Elastic reported “${u?.title||`Elevator Height`}” placed on the ${u?.tab||`dashboard`} tab as a ${u?.type||`widget`}. Lesson 2 is next.`:`Lesson complete. Your auto drove the path and the robot ran runIntake when the auto reached it. Try Free play to keep experimenting.`}),(0,E.jsxs)(`div`,{className:`mt-auto flex flex-col gap-1`,children:[(0,E.jsx)(`button`,{type:`button`,onClick:l,className:`action-buttons sidebar-b`,children:c?`Back to the lesson`:`Free play`}),(0,E.jsx)(`button`,{type:`button`,onClick:p,className:`action-buttons sidebar-b`,children:`Reset lesson`}),(0,E.jsx)(`button`,{type:`button`,onClick:m,className:`action-buttons sidebar-b`,children:`Reset lab`}),(0,E.jsx)(i,{to:`/program/desktop`,className:`action-buttons sidebar-b`,children:`Exit Robot Lab`}),(0,E.jsx)(`button`,{type:`button`,onClick:f,className:`action-buttons sidebar-b`,children:`Full screen`})]})]})}function X(){let e=(0,b.useRef)(null),t=(0,b.useRef)(10),[n,r]=(0,b.useState)({w:900,h:560}),[i,a]=(0,b.useState)(xe),[o,s]=(0,b.useState)(()=>{try{return JSON.parse(sessionStorage.getItem(he)||`null`)}catch{return null}}),[c,l]=(0,b.useState)(()=>J.includes(ye(ge,1))?ye(ge,1):1),[u,d]=(0,b.useState)(!1),[f,p]=(0,b.useState)([]),[m,h]=(0,b.useState)(null),[g,_]=(0,b.useState)(`l1`),[v,ee]=(0,b.useState)({autos:{},paths:{}}),[y,te]=(0,b.useState)([]),[x,S]=(0,b.useState)([]),[C,w]=(0,b.useState)({mode:`teleop`,enabled:!1}),[T,ne]=(0,b.useState)(!1),[D,re]=(0,b.useState)(!1),[ie,O]=(0,b.useState)(!1),[ae,oe]=(0,b.useState)(null),[se,A]=(0,b.useState)(``),[j,M]=(0,b.useState)(()=>Ce(`l1`)),[N,P]=(0,b.useState)(0),R=(0,b.useRef)({}),z=(0,b.useRef)(n);(0,b.useEffect)(()=>{z.current=n},[n]);let B=(0,b.useRef)(i),de=(0,b.useRef)(v),W=(0,b.useRef)(`l1`);(0,b.useEffect)(()=>{B.current=i,de.current=v,W.current=g},[i,v,g]);let q=!u,Y=H.find(e=>e.id===g),X=g===`l1`?I:V,ke=(0,b.useMemo)(()=>U({files:i,deploy:o,openedLessonFile:T,todoVisited:D,widgets:f,project:v,commandRuns:y}),[i,o,T,D,f,v,y]),Ae=fe(ke,Y.steps),je=u||g===`l2`||Ae>=3,Me=u||Ae>=(g===`l1`?2:4),Z=(0,b.useCallback)(e=>{A(e),setTimeout(()=>A(``),3200)},[]);(0,b.useEffect)(()=>{let e;try{e=new BroadcastChannel(`lab-robot`)}catch{return}return e.onmessage=e=>{let t=e.data;if(typeof t==`string`)try{t=JSON.parse(t)}catch{return}t?.type===`layout`&&Array.isArray(t.widgets)?p(t.widgets):t?.type===`chooser`?h(t.selected??null):t?.type===`pathplanner`?ee({autos:t.autos||{},paths:t.paths||{}}):t?.type===`command`?(S(e=>[...e.slice(-7),t.executed?`Command ${t.name} executed`:`WARNING: command ${t.name} is not registered`]),t.executed&&te(e=>e.includes(t.name)?e:[...e,t.name])):t?.type===`auto-started`?S(e=>[...e.slice(-7),`Autonomous started: ${t.name}`]):t?.type===`auto-finished`?S(e=>[...e.slice(-7),`Autonomous finished: ${t.name}`]):t?.type===`auto-missing`&&S(e=>[...e.slice(-7),`ERROR: no autonomous command was returned`])},()=>e.close()},[]);let Ne=f.find(e=>e.topic===L),Pe=e=>{w(e);try{let t=new BroadcastChannel(`lab-robot`);t.postMessage({type:`ds`,...e}),t.close()}catch{}},Q=(0,b.useCallback)((e,t)=>{let n=t-K,r=Math.round(e/2);M(t=>{let i=[`elastic`,`pathplanner`,`ds`].filter(e=>t[e].open&&!t[e].min),a={...t,code:{...t.code,max:!1,min:!1,x:0,y:0,w:i.length?r:e,h:n}};if(i.length===3){let r=Math.round(e*.38),i=e-r,o=Math.round(n*.58),s=Math.round(i*.34);return a.code={...a.code,w:r},a.pathplanner={...t.pathplanner,max:!1,x:r,y:0,w:i,h:o},a.elastic={...t.elastic,max:!1,x:r,y:o,w:i-s,h:n-o},a.ds={...t.ds,max:!1,x:r+i-s,y:o,w:s,h:n-o},a}let o=i.length?Math.floor(n/i.length):n;return i.forEach((s,c)=>{a[s]={...t[s],max:!1,x:r,y:c*o,w:e-r,h:c===i.length-1?n-c*o:o}}),a})},[]);(0,b.useEffect)(()=>{let t=e.current;if(!t)return;let n=!0,i=()=>{let{width:e,height:i}=t.getBoundingClientRect();if(r({w:e,h:i}),n){n=!1,Q(e,i);return}M(t=>Object.fromEntries(Object.entries(t).map(([t,n])=>[t,Se(t,n,e,i)])))};i();let a=new ResizeObserver(i);return a.observe(t),()=>a.disconnect()},[Q]),(0,b.useEffect)(()=>{be(me,Object.fromEntries(Object.entries(i).filter(([e,t])=>t!==G[e])))},[i]),(0,b.useEffect)(()=>{be(ge,c)},[c]);let $=(e,t)=>M(n=>({...n,[e]:{...n[e],...t}})),Fe=e=>$(e,{z:++t.current,min:!1}),Ie=e=>{$(e,{open:!0,min:!1,z:++t.current})},Le=()=>{if(u)d(!1);else{if(!window.confirm(`Free play unlocks every file and app. Your place in the lesson is kept. Continue?`))return;d(!0)}},Re=(0,b.useCallback)(e=>{let n=B.current,r=de.current,i=F(n),a=ue(n)[0]??null,o=a&&r.autos[a]?ce(a,r):null,c={...e,registered:i,autonomous:o?{name:a,timeline:o}:null};s(c);try{sessionStorage.setItem(he,JSON.stringify(c))}catch{}try{let e=new BroadcastChannel(`lab-robot`);e.postMessage({type:`deploy`,...c}),e.close()}catch{}if(e.ok){let n=[];a&&!o&&n.push(`ERROR: PathPlanner auto "${a}" was not found in deploy/pathplanner/autos`);let s=a&&r.autos[a]?le(r).autos[a].commands:[];for(let e of s)i.includes(e)||n.push(`WARNING: named command "${e}" is used by the auto but was never registered`);S(e=>[...e.slice(-5),`Deployed. Registered commands: ${i.join(`, `)||`none`}`,...n]),n.length&&Z(n[0]),(W.current===`l2`||(e.topics||[]).some(e=>e.name===`/SmartDashboard/Elevator Height`))&&(M(e=>({...e,elastic:{...e.elastic,open:!0,min:!1,z:++t.current}})),Q(z.current.w,z.current.h),W.current===`l1`&&Z(`Elastic is unlocked. The dashboard now shows what your code publishes.`))}},[Q,Z]),ze=(0,b.useCallback)(e=>{e.ok||Z(`The build failed. Read the error in the terminal; it names the file and line.`)},[Z]),Be=(0,b.useCallback)(e=>{e===X&&ne(!0)},[X]),Ve=(0,b.useCallback)((e,t)=>{if(e!==X)return;let n=(i[X]||``).split(`
`)[t-1]||``;/TODO/.test(n)&&re(!0)},[i,X]),He=(t,n)=>{if(j[t].max)return;n.preventDefault(),Fe(t);let r=e.current.getBoundingClientRect(),i=n.clientX,a=n.clientY,o=j[t].x,s=j[t].y,c=null;O(!0);let l=e=>{M(n=>({...n,[t]:Se(t,{...n[t],x:o+e.clientX-i,y:s+e.clientY-a},r.width,r.height)}));let n=e.clientX-r.left;c=e.clientY-r.top<_e?`max`:n<_e?`left`:n>r.width-_e?`right`:null,oe(c)},u=()=>{O(!1),oe(null),window.removeEventListener(`pointermove`,l),window.removeEventListener(`pointerup`,u);let e=r.width,n=r.height-K,i=Math.round(e/2);c===`max`?$(t,{max:!0}):c===`left`?$(t,{x:0,y:0,w:i,h:n,max:!1}):c===`right`&&$(t,{x:i,y:0,w:e-i,h:n,max:!1})};window.addEventListener(`pointermove`,l),window.addEventListener(`pointerup`,u)},Ue=(t,n)=>{n.preventDefault(),n.stopPropagation(),Fe(t);let r=e.current.getBoundingClientRect(),i=n.clientX,a=n.clientY,o=j[t].w,s=j[t].h;O(!0);let c=e=>M(n=>({...n,[t]:Se(t,{...n[t],w:o+e.clientX-i,h:s+e.clientY-a},r.width,r.height)})),l=()=>{O(!1),window.removeEventListener(`pointermove`,c),window.removeEventListener(`pointerup`,l)};window.addEventListener(`pointermove`,c),window.addEventListener(`pointerup`,l)},We=()=>Object.entries(i).some(([e,t])=>t!==we(g)[e])||!!o||y.length>0||Object.keys(v.autos).length>0||f.length>0,Ge=()=>({elastic:Ee(),project:v,files:i,wins:j,deploy:o,openedLessonFile:T,todoVisited:D,commandRuns:y,log:x,dsState:C}),Ke=(e,t)=>{Te();let n=t??{files:we(e),wins:Ce(e),deploy:null,openedLessonFile:!1,todoVisited:!1,commandRuns:[],log:[],dsState:{mode:`teleop`,enabled:!1}};if(_(e),a(n.files),M(n.wins),n.deploy)try{sessionStorage.setItem(he,JSON.stringify(n.deploy))}catch{}s(n.deploy),ne(n.openedLessonFile),re(n.todoVisited),te(n.commandRuns),S(n.log),w(n.dsState);try{Object.entries(t?.elastic??{}).forEach(([e,t])=>localStorage.setItem(e,t))}catch{}let r=t?.project;if(r&&(Object.keys(r.autos).length||Object.keys(r.paths).length)){let e={};for(let[t,n]of Object.entries(r.autos))e[`autos/${t}.auto`]=n;for(let[t,n]of Object.entries(r.paths))e[`paths/${t}.path`]=n;try{sessionStorage.setItem(`labFs`,JSON.stringify(e))}catch{}}ee(r??{autos:{},paths:{}}),p([]),h(null),P(e=>e+1),t||setTimeout(()=>Q(z.current.w,z.current.h),0)},qe=e=>{e!==g&&(We()?R.current[g]=Ge():delete R.current[g],Ke(e,R.current[e]))},Je=()=>{window.confirm(`Reset this lesson to its starting point? Your code and the apps go back to the start.`)&&(delete R.current[g],Ke(g,null))},Ye=()=>{window.confirm(`Reset the whole lab? Both lessons, all code and every app go back to the start.`)&&(R.current={},d(!1),Ke(`l1`,null))},Xe=(0,b.useMemo)(()=>Object.entries(j).filter(([,e])=>e.open&&!e.min).sort((e,t)=>t[1].z-e[1].z)[0]?.[0],[j]),Ze=()=>{let t=e.current?.parentElement;t&&(document.fullscreenElement?document.exitFullscreen():t.requestFullscreen?.())},Qe=e=>l(t=>J[Math.min(J.length-1,Math.max(0,J.indexOf(t)+e))]),$e=(0,b.useCallback)(e=>u||e===X,[u,X]),et=ve.filter(e=>u||Y.apps.includes(e.id)),tt=e=>q&&e.id===`elastic`&&!je,nt=e=>e.id===`code`?(0,E.jsx)(k,{files:i,setFile:(e,t)=>a(n=>({...n,[e]:t})),resetProject:()=>{(u||window.confirm(`Reset the project to its starting files?`))&&a({...G})},onDeploy:Re,onResult:ze,onOpenFile:Be,onCursor:Ve,editable:$e,lessonFile:X,deployEnabled:Me,deployBlockedReason:Me?``:g===`l1`?`Publish the elevator height first (step 2), then deploy.`:`Finish the auto and the Java steps (1 to 4) first, then deploy.`,scale:c}):e.id===`ds`?(0,E.jsx)(pe,{state:C,setState:Pe,log:x,deployed:!!o}):(0,E.jsx)(`iframe`,{title:e.title,src:e.src,className:`block h-full w-full border-0 bg-[#0f1115]`,style:{pointerEvents:ie?`none`:`auto`,zoom:c}},N),rt=ae&&(ae===`max`?{left:0,top:0,width:n.w,height:n.h-K}:ae===`left`?{left:0,top:0,width:n.w/2,height:n.h-K}:{left:n.w/2,top:0,width:n.w/2,height:n.h-K});return(0,E.jsxs)(`div`,{className:`flex h-full min-h-[32rem] overflow-hidden border`,"aria-label":`Lab desktop`,children:[(0,E.jsx)(Oe,{lessons:H,lessonId:g,setLessonId:qe,unlocked:!0,steps:Y.steps,state:ke,current:Ae,freePlay:u,toggleFreePlay:Le,placed:Ne,picked:m,onFullscreen:Ze,onResetLesson:Je,onResetLab:Ye}),(0,E.jsxs)(`div`,{ref:e,className:`relative min-w-0 flex-1 overflow-hidden`,children:[et.map(e=>{let t=j[e.id];if(!t.open)return null;let n=t.max?{left:0,top:0,width:`100%`,height:`calc(100% - ${K}px)`,zIndex:t.z}:{left:t.x,top:t.y,width:t.w,height:t.h,zIndex:t.z};return(0,E.jsxs)(`section`,{"aria-label":e.title,onPointerDown:()=>Fe(e.id),className:`absolute flex flex-col overflow-hidden  shadow-2xl ${Xe===e.id?`border-zinc-500`:`border-zinc-700`}`,style:{...n,display:t.min?`none`:`flex`},children:[(0,E.jsxs)(`header`,{onPointerDown:t=>He(e.id,t),onDoubleClick:()=>$(e.id,{max:!t.max}),className:`flex shrink-0 cursor-default select-none items-center justify-between !bg-black border-b border-[rgb(50,50,50)] px-2 py-1 text-xs text-slate-200`,children:[(0,E.jsxs)(`span`,{className:`flex items-center gap-1.5`,children:[(0,E.jsx)(`span`,{"aria-hidden":`true`,children:e.icon}),e.title]}),(0,E.jsxs)(`span`,{className:`flex items-center gap-1`,onPointerDown:e=>e.stopPropagation(),children:[(0,E.jsx)(`button`,{type:`button`,"aria-label":`Minimize ${e.title}`,className:`h-5 w-6 rounded hover:bg-zinc-600`,onClick:()=>$(e.id,{min:!0}),children:`–`}),(0,E.jsx)(`button`,{type:`button`,"aria-label":`Maximize ${e.title}`,className:`h-5 w-6 rounded hover:bg-zinc-600`,onClick:()=>$(e.id,{max:!t.max}),children:t.max?`❐`:`□`}),(0,E.jsx)(`button`,{type:`button`,"aria-label":`Close ${e.title}`,disabled:q,title:q?`Windows stay open during the lesson`:`Close ${e.title}`,className:`h-5 w-6 rounded hover:bg-red-600 disabled:opacity-30 disabled:hover:bg-transparent`,onClick:()=>$(e.id,{open:!1}),children:`×`})]})]}),(0,E.jsx)(`div`,{className:`relative min-h-0 flex-1`,children:nt(e)}),!t.max&&(0,E.jsx)(`div`,{onPointerDown:t=>Ue(e.id,t),className:`absolute bottom-0 right-0 h-4 w-4 cursor-se-resize`,"aria-hidden":`true`})]},e.id)}),rt&&(0,E.jsx)(`div`,{className:`pointer-events-none absolute z-[90] rounded-lg border-2 border-[#7AADFF] bg-[#7AADFF]/20`,style:rt,"aria-hidden":`true`}),(0,E.jsxs)(`nav`,{className:`absolute inset-x-0 bottom-0 z-[100] flex items-center justify-between border-t border-white/10 bg-black/55 px-2 backdrop-blur`,style:{height:K},"aria-label":`Taskbar`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-1`,children:[et.map(e=>{let t=j[e.id],n=t.open,r=tt(e);return(0,E.jsxs)(`button`,{type:`button`,disabled:r,title:r?`Unlocks after you deploy your code`:e.title,"aria-label":r?`${e.title} (locked)`:`${n?`Show`:`Open`} ${e.title}`,onClick:()=>n&&!t.min&&Xe===e.id?$(e.id,{min:!0}):n?Fe(e.id):Ie(e.id),className:`
                    action-buttons !min-h-8   
                    disabled:cursor-not-allowed disabled:opacity-40
disabled:hover:bg-transparent disabled:hover:text-slate-300`,children:[(0,E.jsx)(`span`,{"aria-hidden":`true`,children:r?`🔒`:e.icon}),(0,E.jsx)(`span`,{className:`max-sm:hidden`,children:e.title}),n&&(0,E.jsx)(`span`,{className:`absolute inset-x-2 bottom-0 h-0.5 rounded`,style:{background:e.color}})]},e.id)}),(0,E.jsx)(`span`,{className:`mx-1 h-5 w-px bg-white/15`,"aria-hidden":`true`}),(0,E.jsx)(`button`,{type:`button`,onClick:()=>Q(n.w,n.h),title:`Arrange the open windows side by side`,className:`\r
              action-buttons !min-h-8   `,children:`Tile`})]}),(0,E.jsxs)(`div`,{className:`flex items-center gap-3 pr-1 text-xs text-slate-200`,children:[(0,E.jsxs)(`span`,{className:`flex items-center gap-1`,title:`Scale the app windows`,children:[(0,E.jsx)(`button`,{type:`button`,"aria-label":`Smaller UI`,disabled:c===J[0],onClick:()=>Qe(-1),className:`h-6 w-6 rounded hover:bg-white/10 disabled:opacity-30`,children:`−`}),(0,E.jsxs)(`span`,{"aria-live":`polite`,className:`w-10 text-center`,children:[Math.round(c*100),`%`]}),(0,E.jsx)(`button`,{type:`button`,"aria-label":`Larger UI`,disabled:c===J[J.length-1],onClick:()=>Qe(1),className:`h-6 w-6 rounded hover:bg-white/10 disabled:opacity-30`,children:`+`})]}),(0,E.jsxs)(`span`,{title:o?`Robot code is deployed`:`No code deployed yet`,className:`flex items-center gap-1.5`,children:[(0,E.jsx)(`span`,{className:`h-2 w-2 rounded-full ${o?`bg-green-400`:`bg-zinc-500`}`}),`Robot: `,o?`code running`:`no code`]}),(0,E.jsx)(De,{})]})]}),se&&(0,E.jsx)(`div`,{role:`status`,className:`absolute bottom-12 left-1/2 z-[120] max-w-[85%] -translate-x-1/2 rounded bg-black/80 px-3 py-1.5 text-center text-xs text-white shadow-lg`,children:se})]})]})}export{X as default};