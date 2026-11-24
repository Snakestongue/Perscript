import{_ as e,a as t,f as n}from"./index-Cpusi6-6.js";var r=e(n(),1),i=t(),a=320,o=240,s=`#7AADFF`,c=`#77777F`;function l({mech:e,value:t,target:n,phase:r}){return(0,i.jsxs)(`svg`,{viewBox:`0 0 ${a} ${o}`,className:`mx-auto mt-1 block h-40 w-full rounded-lg bg-zinc-950`,role:`img`,"aria-label":`${e} animation`,children:[e===`elevator`&&(0,i.jsx)(u,{y:t,target:n}),e===`slide`&&(0,i.jsx)(d,{x:t,target:n}),e===`pivot`&&(0,i.jsx)(f,{angle:t,target:n}),e===`flywheel`&&(0,i.jsx)(p,{speed:t,target:n,phase:r})]})}function u({y:e,target:t}){let n=e=>210-Math.max(0,Math.min(1.1,e/1.5))*180;return(0,i.jsxs)(`g`,{children:[(0,i.jsx)(`rect`,{x:`110`,y:30,width:`8`,height:180,fill:`#3f3f46`}),(0,i.jsx)(`rect`,{x:`202`,y:30,width:`8`,height:180,fill:`#3f3f46`}),(0,i.jsx)(`rect`,{x:`90`,y:210,width:`140`,height:`10`,fill:`#52525b`}),(0,i.jsx)(`line`,{x1:`95`,x2:`225`,y1:n(t),y2:n(t),stroke:c,strokeDasharray:`5 4`}),(0,i.jsx)(`text`,{x:`232`,y:n(t)+4,fill:c,fontSize:`11`,children:`target`}),(0,i.jsx)(`rect`,{x:`118`,y:n(e)-26,width:`84`,height:`26`,rx:`3`,fill:s}),(0,i.jsxs)(`text`,{x:`160`,y:n(e)-8,fill:`#000`,fontSize:`11`,textAnchor:`middle`,children:[e.toFixed(2),` m`]})]})}function d({x:e,target:t}){let n=e=>40+Math.max(0,Math.min(1.1,e/1.5))*240;return(0,i.jsxs)(`g`,{children:[(0,i.jsx)(`rect`,{x:30,y:`130`,width:280,height:`8`,fill:`#3f3f46`}),(0,i.jsx)(`rect`,{x:26,y:`100`,width:`8`,height:`38`,fill:`#52525b`}),(0,i.jsx)(`line`,{x1:n(t),x2:n(t),y1:`80`,y2:`130`,stroke:c,strokeDasharray:`5 4`}),(0,i.jsx)(`text`,{x:n(t),y:`74`,fill:c,fontSize:`11`,textAnchor:`middle`,children:`target`}),(0,i.jsx)(`rect`,{x:n(e)-22,y:`98`,width:`44`,height:`32`,rx:`3`,fill:s}),(0,i.jsxs)(`text`,{x:n(e),y:`118`,fill:`#000`,fontSize:`11`,textAnchor:`middle`,children:[e.toFixed(2),` m`]})]})}function f({angle:e,target:t}){let n=e=>[110+120*Math.cos(e),150-120*Math.sin(e)],[r,a]=n(t),[o,l]=n(e);return(0,i.jsxs)(`g`,{children:[(0,i.jsx)(`rect`,{x:104,y:150,width:`12`,height:`60`,fill:`#52525b`}),(0,i.jsx)(`line`,{x1:110,y1:150,x2:r,y2:a,stroke:c,strokeWidth:`6`,strokeDasharray:`6 5`,strokeLinecap:`round`}),(0,i.jsx)(`line`,{x1:110,y1:150,x2:o,y2:l,stroke:s,strokeWidth:`10`,strokeLinecap:`round`}),(0,i.jsx)(`circle`,{cx:110,cy:150,r:`9`,fill:`#e4e4e7`}),(0,i.jsxs)(`text`,{x:`250`,y:`40`,fill:`#999`,fontSize:`12`,textAnchor:`end`,children:[(e*180/Math.PI).toFixed(0),`°`]})]})}function p({speed:e,target:t,phase:n}){let r=[0,1,2,3,4,5].map(e=>{let t=n+e*Math.PI/3;return(0,i.jsx)(`line`,{x1:160,y1:120,x2:160+70*Math.cos(t),y2:120+70*Math.sin(t),stroke:s,strokeWidth:`5`,strokeLinecap:`round`},e)});return(0,i.jsxs)(`g`,{children:[(0,i.jsx)(`circle`,{cx:160,cy:120,r:76,fill:`none`,stroke:`#3f3f46`,strokeWidth:`6`}),r,(0,i.jsx)(`circle`,{cx:160,cy:120,r:`8`,fill:`#e4e4e7`}),(0,i.jsxs)(`text`,{x:160,y:`215`,fill:`#999`,fontSize:`12`,textAnchor:`middle`,children:[e.toFixed(0),` / `,t,` rad/s`]})]})}var m=.005,h={elevator:{label:`Elevator`,unit:`m`,kind:`position`,start:0,plant:{kS:.25,kG:.6,kV:2.5,kA:.15},gravity:`constant`,maxVel:1.5,maxAccel:4,blurb:`Gravity always pulls down, so you need a constant kG.`},pivot:{label:`Arm / Pivot`,unit:`rad`,kind:`position`,start:0,plant:{kS:.2,kG:.8,kV:1.2,kA:.1},gravity:`cosine`,maxVel:4,maxAccel:12,blurb:`Gravity changes with angle, so kG is multiplied by cos(angle).`},slide:{label:`Horizontal Slide`,unit:`m`,kind:`position`,start:0,plant:{kS:.3,kG:0,kV:3,kA:.2},gravity:`none`,maxVel:1.2,maxAccel:3,blurb:`No gravity, just friction and inertia. kG stays at 0.`},flywheel:{label:`Flywheel`,unit:`rad/s`,kind:`velocity`,start:0,plant:{kS:.15,kG:0,kV:.02,kA:.01},gravity:`none`,maxVel:0,maxAccel:600,blurb:`Velocity control. kV does most of the work.`}},g={nominal:{label:`Nominal`,mass:1,friction:1,battery:12},heavy:{label:`Heavy load`,mass:2,friction:1,battery:12},sticky:{label:`High friction`,mass:1,friction:2.5,battery:12},lowBattery:{label:`Low battery (9 V)`,mass:1,friction:1,battery:9}},_=[{id:`slide-1`,mech:`slide`,cond:`nominal`,target:1,title:`Slide to 1 m`,goal:{settle:2,overshoot:10,sse:.02},hint:`Start with kV and kS, then add a little kP.`},{id:`elev-1`,mech:`elevator`,cond:`nominal`,target:1,title:`Raise the elevator`,goal:{settle:2,overshoot:5,sse:.02},hint:`Without kG the elevator sags. Try kG near 0.6.`},{id:`elev-2`,mech:`elevator`,cond:`heavy`,target:1.2,title:`Elevator carrying a game piece`,goal:{settle:2.5,overshoot:5,sse:.02},hint:`Mass raises kG and kA. Retune them.`},{id:`pivot-1`,mech:`pivot`,cond:`nominal`,target:1.2,title:`Arm to 70°`,goal:{settle:1.5,overshoot:8,sse:.03},hint:`kG * cos(angle) fights gravity, so the hold needs it.`},{id:`pivot-2`,mech:`pivot`,cond:`lowBattery`,target:1.5,title:`Arm on a weak battery`,goal:{settle:2,overshoot:8,sse:.03},hint:`Voltage is capped at 9 V, so don't ask for too much.`},{id:`fly-1`,mech:`flywheel`,cond:`nominal`,target:300,title:`Spin up to 300 rad/s`,goal:{settle:1.5,overshoot:5,sse:6},hint:`kV ≈ 12 / max speed gets you close.`},{id:`fly-2`,mech:`flywheel`,cond:`sticky`,target:300,title:`Flywheel with high friction`,goal:{settle:2,overshoot:5,sse:6},hint:`Friction needs kS, and a bit of I removes the leftover error.`}];function v(e,t,n){let r=n-t,i=Math.sign(r)||1,a=Math.abs(r);if(e.kind===`velocity`){let r=e.maxAccel,o=a/r;return e=>e>=o?{p:n,v:0,a:0}:{p:t+i*r*e,v:i*r*e,a:i*r}}let o=e.maxVel,s=e.maxAccel;o*o/s>a&&(o=Math.sqrt(a*s));let c=o/s,l=.5*s*c*c,u=(a-2*l)/o,d=2*c+u;return e=>{if(e>=d)return{p:n,v:0,a:0};let r,a,f;if(e<c)f=s,a=s*e,r=.5*s*e*e;else if(e<c+u)f=0,a=o,r=l+o*(e-c);else{let t=e-c-u;f=-s,a=o-s*t,r=l+o*u+o*t-.5*s*t*t}return{p:t+i*r,v:i*a,a:i*f}}}function y(e,t,n,r,i={}){let a=h[e],o=g[t],{kP:s,kI:c,kD:l,kS:u,kG:d,kV:f,kA:p}=r,_={kS:a.plant.kS*o.friction*(i.kS??1),kG:a.plant.kG*o.mass*(i.kG??1),kV:a.plant.kV*(i.kV??1),kA:a.plant.kA*o.mass*(i.kA??1)},y=v(a,a.start,n),x=a.kind===`velocity`,S=a.start,C=0,w=0,T=null,E=[];for(let e=0;e<=4.000000001;e+=m){let t=y(e),n=x?C:S,r=t.p-n;w+=r*m;let i=Math.max(-3,Math.min(3,c*w)),h=T===null?0:(r-T)/m;T=r;let g=a.gravity===`cosine`?Math.cos(S):+(a.gravity===`constant`);Math.sign(x?t.p:t.v);let v=s*r+i+l*h+u*(Math.abs(r)>1e-6?Math.sign(r):0)+d*g+f*(x?t.p:t.v)+p*t.a;v=Math.max(-o.battery,Math.min(o.battery,v));let b=_.kG*g,D=Math.abs(C)>1e-4?_.kS*Math.sign(C):0,O=v-b-_.kV*C-D;Math.abs(C)<=1e-4&&Math.abs(v-b)<=_.kS?O=0:Math.abs(C)<=1e-4&&(O-=_.kS*Math.sign(v-b));let k=O/_.kA;C+=k*m,S+=C*m,a.kind===`position`&&a.gravity!==`cosine`&&S<0&&(S=0,C<0&&(C=0)),Math.round(e/.005)%4==0&&E.push({t:+e.toFixed(3),ref:t.p,y:x?C:S,volts:v})}return{data:E,metrics:b(E,a.start,n)}}function b(e,t,n){let r=Math.abs(n-t)||1,i=Math.sign(n-t)||1,a=.02*r,o=4;for(let t=e.length-1;t>=0;t--){if(Math.abs(e[t].y-n)>a){o=t===e.length-1?4:e[t+1].t;break}t===0&&(o=0)}let s=Math.max(...e.map(e=>(e.y-n)*i)),c=Math.max(0,s/r*100),l=Math.abs(e[e.length-1].y-n);return{settle:Math.abs(e[e.length-1].y-n)<=a?o:null,overshoot:c,sse:l}}function x(e,t){return{settle:e.settle!==null&&e.settle<=t.settle,overshoot:e.overshoot<=t.overshoot,sse:e.sse<=t.sse}}var S=[{value:`java`,label:`Java`},{value:`cpp`,label:`C++`},{value:`python`,label:`Python`}],C=[{value:`wpimath`,label:`WPILib (wpimath)`},{value:`ctre`,label:`CTRE Phoenix 6 (TalonFX)`},{value:`rev`,label:`REV (SparkMax)`}],w=e=>+Number(e).toFixed(4);function T(e,t,n,r){let i=h[t],a=i.kind===`velocity`,o=t===`elevator`?`ElevatorFeedforward`:t===`pivot`?`ArmFeedforward`:`SimpleMotorFeedforward`,s=t===`elevator`||t===`pivot`,c=s?`${w(n.kS)}, ${w(n.kG)}, ${w(n.kV)}, ${w(n.kA)}`:`${w(n.kS)}, ${w(n.kV)}, ${w(n.kA)}`,l=t===`pivot`?`angleRad, velocity`:`velocity`;return e===`java`?a?`PIDController pid = new PIDController(${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)});
SimpleMotorFeedforward ff = new SimpleMotorFeedforward(${c});

// call every loop (setpoint ${r} ${i.unit})
double volts = pid.calculate(encoder.getVelocity(), ${r})
             + ff.calculate(${r});
motor.setVoltage(volts);`:`ProfiledPIDController pid = new ProfiledPIDController(
    ${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)},
    new TrapezoidProfile.Constraints(${i.maxVel}, ${i.maxAccel}));
${o} ff = new ${o}(${c});

// call every loop (goal ${r} ${i.unit})
double volts = pid.calculate(encoder.getPosition(), ${r});
double velocity = pid.getSetpoint().velocity;${t===`pivot`?`
double angleRad = encoder.getPosition();`:``}
volts += ff.calculate(${l});
motor.setVoltage(volts);`:e===`cpp`?a?`frc::PIDController pid{${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)}};
frc::SimpleMotorFeedforward<units::radians> ff{
    units::volt_t{${w(n.kS)}}, units::volt_t{${w(n.kV)}} / 1_rad_per_s,
    units::volt_t{${w(n.kA)}} / 1_rad_per_s_sq};

// call every loop (setpoint ${r} rad/s)
double volts = pid.Calculate(encoder.GetVelocity(), ${r})
             + ff.Calculate(units::radians_per_second_t{${r}}).value();
motor.SetVoltage(units::volt_t{volts});`:`// Unit types simplified: wrap values in your mechanism's units (meters / radians).
frc::ProfiledPIDController<units::${t===`pivot`?`radians`:`meters`}> pid{
    ${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)},
    {${i.maxVel}_${t===`pivot`?`rad_per_s`:`mps`}, ${i.maxAccel}_${t===`pivot`?`rad_per_s_sq`:`mps_sq`}}};
// Feedforward gains: ${s?`kS, kG, kV, kA`:`kS, kV, kA`} = ${c}
// (use frc::${o} with your unit types)

// call every loop (goal ${r} ${i.unit})
double volts = pid.Calculate(units::${t===`pivot`?`radian`:`meter`}_t{encoder.GetPosition()},
                             units::${t===`pivot`?`radian`:`meter`}_t{${r}}).value();
// volts += ff.Calculate(...) using pid.GetSetpoint().velocity
motor.SetVoltage(units::volt_t{volts});`:a?`from wpimath.controller import PIDController, SimpleMotorFeedforwardMeters

pid = PIDController(${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)})
ff = SimpleMotorFeedforwardMeters(${c})

# call every loop (setpoint ${r} ${i.unit})
volts = pid.calculate(encoder.getVelocity(), ${r}) + ff.calculate(${r})
motor.setVoltage(volts)`:`from wpimath.controller import ProfiledPIDController, ${o}
from wpimath.trajectory import TrapezoidProfile

pid = ProfiledPIDController(
    ${w(n.kP)}, ${w(n.kI)}, ${w(n.kD)},
    TrapezoidProfile.Constraints(${i.maxVel}, ${i.maxAccel}),
)
ff = ${o}(${c})

# call every loop (goal ${r} ${i.unit})
volts = pid.calculate(encoder.getPosition(), ${r})
velocity = pid.getSetpoint().velocity
volts += ff.calculate(${t===`pivot`?`encoder.getPosition(), velocity`:`velocity`})
motor.setVoltage(volts)`}function E(e,t,n,r){let i=h[t],a=i.kind===`velocity`,o=t===`elevator`?`Elevator_Static`:t===`pivot`?`Arm_Cosine`:null,s=`Phoenix 6 gains are in volts per mechanism rotation (or rotation/s).
Convert ${i.unit} to rotations with your sensor-to-mechanism ratio.`;return e===`java`?`// ${s.replace(`
`,`
// `)}
TalonFX motor = new TalonFX(1);
Slot0Configs slot0 = new Slot0Configs()
    .withKP(${w(n.kP)}).withKI(${w(n.kI)}).withKD(${w(n.kD)})
    .withKS(${w(n.kS)}).withKV(${w(n.kV)}).withKA(${w(n.kA)})${o?`
    .withKG(${w(n.kG)}).withGravityType(GravityTypeValue.${o})`:``};
${a?``:`MotionMagicConfigs mm = new MotionMagicConfigs()
    .withMotionMagicCruiseVelocity(${i.maxVel})
    .withMotionMagicAcceleration(${i.maxAccel});
motor.getConfigurator().apply(mm);
`}motor.getConfigurator().apply(slot0);

// ${a?`VelocityVoltage`:`MotionMagicVoltage`} runs the PID + feedforward on the motor controller
motor.setControl(new ${a?`VelocityVoltage`:`MotionMagicVoltage`}(${r}));`:e===`cpp`?`// ${s.replace(`
`,`
// `)}
ctre::phoenix6::hardware::TalonFX motor{1};
ctre::phoenix6::configs::Slot0Configs slot0{};
slot0.kP = ${w(n.kP)}; slot0.kI = ${w(n.kI)}; slot0.kD = ${w(n.kD)};
slot0.kS = ${w(n.kS)}; slot0.kV = ${w(n.kV)}; slot0.kA = ${w(n.kA)};${o?`
slot0.kG = ${w(n.kG)};
slot0.GravityType = ctre::phoenix6::signals::GravityTypeValue::${o.replace(`_`,`_`)};`:``}
${a?``:`ctre::phoenix6::configs::MotionMagicConfigs mm{};
mm.MotionMagicCruiseVelocity = ${i.maxVel}_tps;
mm.MotionMagicAcceleration = ${i.maxAccel}_tr_per_s_sq;
motor.GetConfigurator().Apply(mm);
`}motor.GetConfigurator().Apply(slot0);

motor.SetControl(ctre::phoenix6::controls::${a?`VelocityVoltage`:`MotionMagicVoltage`}{${a?`units::turns_per_second_t{${r}}`:`units::turn_t{${r}}`}});`:`# ${s.replace(`
`,`
# `)}
from phoenix6 import hardware, configs, controls${o?`, signals`:``}

motor = hardware.TalonFX(1)
slot0 = (
    configs.Slot0Configs()
    .with_k_p(${w(n.kP)}).with_k_i(${w(n.kI)}).with_k_d(${w(n.kD)})
    .with_k_s(${w(n.kS)}).with_k_v(${w(n.kV)}).with_k_a(${w(n.kA)})${o?`
    .with_k_g(${w(n.kG)}).with_gravity_type(signals.GravityTypeValue.${o.toUpperCase()})`:``}
)
${a?``:`mm = (
    configs.MotionMagicConfigs()
    .with_motion_magic_cruise_velocity(${i.maxVel})
    .with_motion_magic_acceleration(${i.maxAccel})
)
motor.configurator.apply(mm)
`}motor.configurator.apply(slot0)

motor.set_control(controls.${a?`VelocityVoltage`:`MotionMagicVoltage`}(${r}))`}function D(e,t,n,r){let i=h[t],a=i.kind===`velocity`,o=t===`elevator`||t===`pivot`,s=e=>w(e/12),c=`REV closed-loop output is duty cycle (-1..1), so volts-based gains are divided by 12 here.
Feedforward is sent as arbitrary volts with each setpoint. Check units against your encoder conversion factors.`,l=o?`${w(n.kS)} + ${w(n.kG)}${t===`pivot`?` * Math.cos(angleRad)`:``} + ${w(n.kV)} * velocitySetpoint`:`${w(n.kS)} + ${w(n.kV)} * velocitySetpoint`;return e===`java`?`// ${c.replace(/\n/g,`
// `)}
SparkMax motor = new SparkMax(1, MotorType.kBrushless);
SparkMaxConfig config = new SparkMaxConfig();
config.closedLoop
    .feedbackSensor(FeedbackSensor.kPrimaryEncoder)
    .pid(${s(n.kP)}, ${s(n.kI)}, ${s(n.kD)})${a?``:`;
config.closedLoop.maxMotion
    .maxVelocity(${i.maxVel})
    .maxAcceleration(${i.maxAccel})`};
motor.configure(config, ResetMode.kResetSafeParameters, PersistMode.kPersistParameters);

// call every loop (setpoint ${r} ${i.unit})
double arbFF = ${l.replace(`velocitySetpoint`,a?String(r):`velocitySetpoint`)};
motor.getClosedLoopController().setReference(
    ${r}, ControlType.${a?`kVelocity`:`kMAXMotionPositionControl`},
    ClosedLoopSlot.kSlot0, arbFF, ArbFFUnits.kVoltage);`:e===`cpp`?`// ${c.replace(/\n/g,`
// `)}
rev::spark::SparkMax motor{1, rev::spark::SparkLowLevel::MotorType::kBrushless};
rev::spark::SparkMaxConfig config;
config.closedLoop
    .SetFeedbackSensor(rev::spark::ClosedLoopConfig::FeedbackSensor::kPrimaryEncoder)
    .Pid(${s(n.kP)}, ${s(n.kI)}, ${s(n.kD)});${a?``:`
config.closedLoop.maxMotion
    .MaxVelocity(${i.maxVel})
    .MaxAcceleration(${i.maxAccel});`}
motor.Configure(config, rev::spark::SparkBase::ResetMode::kResetSafeParameters,
                rev::spark::SparkBase::PersistMode::kPersistParameters);

// call every loop (setpoint ${r} ${i.unit})
double arbFF = ${l.replace(`velocitySetpoint`,a?String(r):`velocitySetpoint`).replace(`Math.cos`,`std::cos`)};
motor.GetClosedLoopController().SetReference(
    ${r}, rev::spark::SparkLowLevel::ControlType::${a?`kVelocity`:`kMAXMotionPositionControl`},
    rev::spark::kSlot0, arbFF, rev::spark::SparkClosedLoopController::ArbFFUnits::kVoltage);`:`# ${c.replace(/\n/g,`
# `)}
from rev import SparkMax, SparkMaxConfig, SparkBase, ClosedLoopConfig, ClosedLoopSlot, SparkLowLevel
${o&&t===`pivot`?`import math
`:``}
motor = SparkMax(1, SparkLowLevel.MotorType.kBrushless)
config = SparkMaxConfig()
config.closedLoop.setFeedbackSensor(ClosedLoopConfig.FeedbackSensor.kPrimaryEncoder).pid(
    ${s(n.kP)}, ${s(n.kI)}, ${s(n.kD)}
)${a?``:`
config.closedLoop.maxMotion.maxVelocity(${i.maxVel}).maxAcceleration(${i.maxAccel})`}
motor.configure(config, SparkBase.ResetMode.kResetSafeParameters, SparkBase.PersistMode.kPersistParameters)

# call every loop (setpoint ${r} ${i.unit})
arb_ff = ${l.replace(`velocitySetpoint`,a?String(r):`velocity_setpoint`).replace(`Math.cos(angleRad)`,`math.cos(angle_rad)`)}
motor.getClosedLoopController().setReference(
    ${r},
    SparkLowLevel.ControlType.${a?`kVelocity`:`kMAXMotionPositionControl`},
    ClosedLoopSlot.kSlot0,
    arb_ff,
    SparkClosedLoopController.ArbFFUnits.kVoltage,
)`}function O(e,t,n,r,i){return t===`ctre`?E(e,n,r,i):t===`rev`?D(e,n,r,i):T(e,n,r,i)}var k={kP:0,kI:0,kD:0,kS:0,kG:0,kV:0,kA:0},A=[{key:`kP`,max:20,step:.05},{key:`kI`,max:10,step:.05},{key:`kD`,max:2,step:.005},{key:`kS`,max:1,step:.01},{key:`kG`,max:2,step:.01},{key:`kV`,max:5,step:.005},{key:`kA`,max:.5,step:.005}];function j({data:e,target:t,unit:n,playT:r}){let a=e.flatMap(e=>[e.y,e.ref]).concat([t,0]),o=Math.min(...a),s=Math.max(...a);s-o<1e-6&&(s=o+1);let c=(s-o)*.1;o-=c,s+=c;let l=e=>30+e/4*(640-30*1.5),u=e=>140-(e-o)/(s-o)*(170-30*1.5),d=t=>e.map((e,n)=>`${n?`L`:`M`}${l(e.t).toFixed(1)},${u(e[t]).toFixed(1)}`).join(``),f=Math.abs(t)*.02;return(0,i.jsxs)(`svg`,{viewBox:`0 0 640 170`,className:`block w-full`,role:`img`,"aria-label":`Mechanism response chart`,children:[(0,i.jsx)(`rect`,{x:30,y:u(t+f),width:640-30*1.5,height:Math.max(1,u(t-f)-u(t+f)),fill:`#7AADFF`,opacity:`0.15`}),(0,i.jsx)(`line`,{x1:30,x2:640-30/2,y1:u(t),y2:u(t),stroke:`#555`,strokeDasharray:`4 4`}),(0,i.jsx)(`line`,{x1:30,x2:30,y1:30/2,y2:140,stroke:`#555`}),(0,i.jsx)(`line`,{x1:30,x2:640-30/2,y1:140,y2:140,stroke:`#555`}),(0,i.jsx)(`path`,{d:d(`ref`),fill:`none`,stroke:`#77777F`,strokeWidth:`1.5`,strokeDasharray:`5 3`}),(0,i.jsx)(`path`,{d:d(`y`),fill:`none`,stroke:`#7AADFF`,strokeWidth:`2.5`}),(0,i.jsx)(`line`,{x1:l(r),x2:l(r),y1:30/2,y2:140,stroke:`#e4e4e7`,strokeWidth:`1`,opacity:`0.6`}),(0,i.jsx)(`text`,{x:30,y:162,fill:`#999`,fontSize:`11`,children:`0 s`}),(0,i.jsxs)(`text`,{x:610,y:162,fill:`#999`,fontSize:`11`,children:[4,` s`]}),(0,i.jsx)(`text`,{x:4,y:u(t)+4,fill:`#999`,fontSize:`11`,children:+t.toFixed(2)}),(0,i.jsxs)(`text`,{x:520,y:16,fill:`#7AADFF`,fontSize:`11`,children:[`response (`,n,`)`]}),(0,i.jsx)(`text`,{x:520,y:30,fill:`#999`,fontSize:`11`,children:`profile / setpoint`})]})}function M({embedded:e,children:t}){return e?(0,i.jsx)(`div`,{className:`w-full text-slate-100`,children:t}):(0,i.jsx)(`main`,{className:`mx-auto w-full max-w-[1200px] px-5 py-10 text-slate-100`,children:t})}function N({embedded:e=!1}){let[t,n]=(0,r.useState)(_[0].id),[a,o]=(0,r.useState)(k),[s,c]=(0,r.useState)(()=>{try{return JSON.parse(localStorage.getItem(`pidDone`)||`[]`)}catch{return[]}}),[u,d]=(0,r.useState)(`java`),[f,p]=(0,r.useState)(`wpimath`),[m,v]=(0,r.useState)(!1),[b,w]=(0,r.useState)(null),[T,E]=(0,r.useState)(4),[D,N]=(0,r.useState)(!1),[P,F]=(0,r.useState)(0),I=b??_.find(e=>e.id===t),L=h[I.mech];(0,r.useEffect)(()=>{e||(document.title=`Perscript | PID Tuning`)},[e]);let{data:R,metrics:z}=(0,r.useMemo)(()=>y(I.mech,I.cond,I.target,a,I.scale),[I,a]),B=x(z,I.goal),V=B.settle&&B.overshoot&&B.sse,H=V&&!I.random&&!s.includes(I.id)?[...s,I.id]:s;(0,r.useEffect)(()=>{if(!D)return;let e,t=performance.now()-T*1e3,n=r=>{let i=Math.max(0,(r-t)/1e3);if(i>=4){E(4),N(!1);return}E(i),e=requestAnimationFrame(n)};return e=requestAnimationFrame(n),()=>cancelAnimationFrame(e)},[D,P]);let U=Math.max(0,Math.min(R.length-1,Math.round(T/(R[1].t-R[0].t)))),W=(0,r.useMemo)(()=>{if(I.mech!==`flywheel`)return null;let e=R[1].t-R[0].t,t=0;return R.map(n=>t+=n.y*e)},[R,I.mech]),G=()=>{E(0),F(e=>e+1),N(!0)},K=e=>{o(e),G()};(0,r.useEffect)(()=>{try{localStorage.setItem(`pidDone`,JSON.stringify(H))}catch{}},[H]);let q=(0,r.useMemo)(()=>O(u,f,I.mech,a,I.target),[u,f,I,a]),J=e=>{c(H),w(null),n(e),o(k),G()},Y=(e,t=2)=>e===null?`never`:e.toFixed(t),X=[{label:`Settle within 2%`,value:z.settle===null?`never`:`${Y(z.settle)} s`,goal:`≤ ${I.goal.settle} s`,ok:B.settle},{label:`Overshoot`,value:`${Y(z.overshoot,1)} %`,goal:`≤ ${I.goal.overshoot} %`,ok:B.overshoot},{label:`Final error`,value:`${Y(z.sse,3)} ${L.unit}`,goal:`≤ ${I.goal.sse} ${L.unit}`,ok:B.sse}];return(0,i.jsxs)(M,{embedded:e,children:[(0,i.jsxs)(`div`,{className:`flex flex-wrap items-baseline gap-x-3`,children:[(0,i.jsx)(`h1`,{className:`text-2xl font-semibold`,children:`PID Tuning Lab`}),(0,i.jsx)(`p`,{className:`text-sm text-slate-400`,children:`Tune P, I, D and feedforward (kS, kG, kV, kA). Meet every goal to clear the challenge.`})]}),(0,i.jsx)(`div`,{className:`@container mt-3`,children:(0,i.jsxs)(`div`,{className:`grid gap-3 @xl:grid-cols-[minmax(0,1.5fr)_minmax(14rem,1fr)]`,children:[(0,i.jsxs)(`section`,{className:`min-w-0 rounded-xl border border-zinc-800 p-3`,children:[(0,i.jsxs)(`div`,{className:`flex flex-wrap items-baseline justify-between gap-x-3`,children:[(0,i.jsx)(`h2`,{className:`text-base font-semibold`,children:I.title}),(0,i.jsxs)(`p`,{className:`text-xs text-slate-400`,children:[L.label,` · `,g[I.cond].label,` · target `,I.target,` `,L.unit]})]}),(0,i.jsx)(l,{mech:I.mech,value:R[U].y,target:I.target,phase:W?W[U]:0}),(0,i.jsxs)(`div`,{className:`my-1.5 flex items-center gap-2 text-xs`,children:[(0,i.jsx)(`button`,{className:`text-[#7AADFF]`,onClick:G,children:D?`Restart`:`▶ Play`}),(0,i.jsx)(`input`,{type:`range`,min:`0`,max:4,step:`0.01`,value:T,onChange:e=>{N(!1),E(parseFloat(e.target.value))},className:`flex-1`,"aria-label":`Playback time`}),(0,i.jsxs)(`span`,{className:`w-12 text-right tabular-nums text-slate-400`,children:[T.toFixed(2),` s`]})]}),(0,i.jsx)(j,{data:R,target:I.target,unit:L.unit,playT:T})]}),(0,i.jsxs)(`section`,{className:`min-w-0 rounded-xl border border-zinc-800 p-3 @xl:sticky @xl:top-3 @xl:self-start`,children:[(0,i.jsxs)(`div`,{className:`mb-1.5 flex items-center justify-between`,children:[(0,i.jsx)(`h2`,{className:`text-base font-semibold`,children:`Gains`}),(0,i.jsx)(`button`,{className:`text-xs text-[#7AADFF]`,onClick:()=>K(k),children:`Reset`})]}),A.map(e=>(0,i.jsxs)(`label`,{className:`grid grid-cols-[1.6rem_minmax(0,1fr)_3.4rem] items-center gap-2 py-0.5 text-xs`,children:[(0,i.jsx)(`span`,{className:`font-medium`,children:e.key}),(0,i.jsx)(`input`,{type:`range`,min:`0`,max:e.max,step:e.step,value:a[e.key],onChange:t=>K({...a,[e.key]:parseFloat(t.target.value)}),className:`w-full`}),(0,i.jsx)(`span`,{className:`text-right tabular-nums text-slate-300`,children:a[e.key].toFixed(3)})]},e.key)),(0,i.jsx)(`ul`,{className:`mt-2 space-y-0.5 border-t border-zinc-800 pt-2 text-xs`,children:X.map(e=>(0,i.jsxs)(`li`,{className:e.ok?`text-green-400`:`text-red-400`,children:[e.ok?`✓`:`✗`,` `,e.label,`: `,e.value,` `,(0,i.jsxs)(`span`,{className:`text-slate-500`,children:[`(goal `,e.goal,`)`]})]},e.label))}),V&&(0,i.jsx)(`p`,{className:`mt-1.5 text-sm font-semibold text-green-400`,children:`Challenge complete!`}),(0,i.jsxs)(`p`,{className:`mt-1.5 text-xs text-slate-500`,children:[`Hint: `,I.hint]})]})]})}),(0,i.jsx)(`div`,{className:`mt-3 flex flex-wrap gap-1.5`,children:_.map(e=>(0,i.jsxs)(`button`,{onClick:()=>J(e.id),className:`
              rounded-md border px-3 py-1 text-xs text-[oklch(0.96_0.003_260)] cursor-pointer transition-colors ${e.id===t&&!b?`border-[#7AADFF] bg-[#7AADFF]/20`:`border-zinc-700 hover:border-[#7AADFF] hover:bg-[#7AADFF]`}
                
              `,children:[H.includes(e.id)?`✓ `:``,e.title]},e.id))}),(0,i.jsxs)(`section`,{className:`mt-3 rounded-xl border border-zinc-800 p-3`,children:[(0,i.jsxs)(`div`,{className:`mb-3 flex flex-wrap items-center gap-3`,children:[(0,i.jsx)(`h2`,{className:`mr-auto text-lg font-semibold`,children:`Equivalent code`}),(0,i.jsx)(`select`,{value:f,onChange:e=>p(e.target.value),className:`rounded border border-zinc-700 bg-black px-2 py-1 text-sm`,"aria-label":`Library`,children:C.map(e=>(0,i.jsx)(`option`,{value:e.value,children:e.label},e.value))}),(0,i.jsx)(`select`,{value:u,onChange:e=>d(e.target.value),className:`rounded border border-zinc-700 bg-black px-2 py-1 text-sm`,"aria-label":`Language`,children:S.map(e=>(0,i.jsx)(`option`,{value:e.value,children:e.label},e.value))}),(0,i.jsx)(`button`,{className:`text-sm text-[#7AADFF]`,onClick:()=>{navigator.clipboard?.writeText(q),v(!0),setTimeout(()=>v(!1),1500)},children:m?`Copied!`:`Copy`})]}),(0,i.jsx)(`pre`,{className:`overflow-x-auto rounded bg-zinc-950 p-3 text-xs leading-relaxed text-slate-200`,children:(0,i.jsx)(`code`,{children:q})}),(0,i.jsx)(`p`,{className:`!mt-2 text-xs text-slate-500`,children:`Starter code for your current gains. Check units and class names against the library version you use.`})]})]})}export{N as default};