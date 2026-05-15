import DesktopCalculator from "./DesktopCalculator";
import MobileCalculator from "./MobileCalculator";

const Calculator = () => {
  return (
    <div>
      <div className="lg:block hidden">
        <DesktopCalculator />
      </div>
      <div className="block lg:hidden">
        <MobileCalculator />
      </div>
    </div>
  );
};

export default Calculator;
