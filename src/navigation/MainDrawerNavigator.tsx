import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { colors } from '../constants/theme';
import CustomDrawerContent from './CustomDrawerContent';

// Import screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import PaidZakatScreen from '../screens/PaidZakat/PaidZakatScreen';
import CashCalculator from '../screens/Calculators/CashCalculatorScreen';
import GoldCalculator from '../screens/Calculators/GoldCalculatorScreen';
import InsuranceCalculator from '../screens/Calculators/InsuranceCalculatorScreen';
import SharesCalculator from '../screens/Calculators/SharesCalculatorScreen';
import ETFCalculator from '../screens/Calculators/ETFCalculatorScreen';
import MutualFundsCalculator from '../screens/Calculators/MutualFundsCalculatorScreen';
import SukukCalculator from '../screens/Calculators/SukukCalculatorScreen';
import InvestmentLandCalculator from '../screens/Calculators/InvestmentLandCalculatorScreen';
import InvestmentPropertyCalculator from '../screens/Calculators/InvestmentPropertyCalculatorScreen';
import CryptoCalculator from '../screens/Calculators/CryptoCalculatorScreen';
import NFTCalculator from '../screens/Calculators/NFTCalculatorScreen';
import CommodityCalculator from '../screens/Calculators/CommodityCalculatorScreen';
import REITCalculator from '../screens/Calculators/REITCalculatorScreen';
import ETCCalculator from '../screens/Calculators/ETCCalculatorScreen';
import PrivateEquityCalculator from '../screens/Calculators/PrivateEquityCalculatorScreen';
import BusinessCalculator from '../screens/Calculators/BusinessCalculatorScreen';
import PayZakatScreen from '../screens/Payment/PayZakatScreen';
import CompletePaymentScreen from '../screens/Payment/CompletePaymentScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

const Drawer = createDrawerNavigator();

// All calculator screens are hidden from the default drawer rendering
// and instead rendered by CustomDrawerContent in a collapsible group
const hiddenFromDrawer = { drawerItemStyle: { display: 'none' as const } };

const MainDrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: colors.primary[700],
        drawerInactiveTintColor: colors.gray[700],
      }}
    >
      {/* Main Sections */}
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={hiddenFromDrawer} />
      <Drawer.Screen name="PaidZakat" component={PaidZakatScreen} options={hiddenFromDrawer} />

      {/* Calculator Screens (rendered by CustomDrawerContent) */}
      <Drawer.Screen name="CashCalculator" component={CashCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="GoldCalculator" component={GoldCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="InsuranceCalculator" component={InsuranceCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="SharesCalculator" component={SharesCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="ETFCalculator" component={ETFCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="MutualFundsCalculator" component={MutualFundsCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="SukukCalculator" component={SukukCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="InvestmentLandCalculator" component={InvestmentLandCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="InvestmentPropertyCalculator" component={InvestmentPropertyCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="CryptoCalculator" component={CryptoCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="NFTCalculator" component={NFTCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="CommodityCalculator" component={CommodityCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="REITCalculator" component={REITCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="ETCCalculator" component={ETCCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="PrivateEquityCalculator" component={PrivateEquityCalculator} options={hiddenFromDrawer} />
      <Drawer.Screen name="BusinessCalculator" component={BusinessCalculator} options={hiddenFromDrawer} />

      {/* Payment Screens */}
      <Drawer.Screen name="PayZakat" component={PayZakatScreen} options={hiddenFromDrawer} />
      <Drawer.Screen name="CompletePayment" component={CompletePaymentScreen} options={hiddenFromDrawer} />

      {/* Settings */}
      <Drawer.Screen name="Settings" component={SettingsScreen} options={hiddenFromDrawer} />
    </Drawer.Navigator>
  );
};

export default MainDrawerNavigator;
