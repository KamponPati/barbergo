import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CustomerBottomTabBar } from "../components/BottomTabBar";
import { HomeScreen }         from "../screens/HomeScreen";
import { DeliveryScreen }     from "../screens/DeliveryScreen";
import { BookingsScreen }     from "../screens/BookingsScreen";
import { TrackingScreen }     from "../screens/TrackingScreen";
import { RewardsScreen }      from "../screens/RewardsScreen";
import { ShopDetailScreen }   from "../screens/ShopDetailScreen";
import { BookingFlowScreen }  from "../screens/BookingFlowScreen";
import { palette }            from "../theme";

// ─── Stack param types ────────────────────────────────────────────────────────
export type CustomerStackParamList = {
  HomeMain:    undefined;
  ShopDetail:  { shopId: string; shopName: string };
  BookingFlow: {
    shopId:       string;
    shopName:     string;
    serviceId:    string;
    serviceName:  string;
    servicePrice: number;
  };
};

// ─── Tab param types ──────────────────────────────────────────────────────────
export type CustomerTabParamList = {
  Home:     undefined;
  Delivery: undefined;
  Bookings: undefined;
  Tracking: undefined;
  Rewards:  undefined;
};

const Tab   = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

// Home tab has its own stack (Shop list → Shop detail → Booking flow)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: palette.card },
        headerTintColor:  palette.brand,
        headerTitleStyle: { fontWeight: "700", color: palette.ink },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="HomeMain"    component={HomeScreen}        options={{ headerShown: false }} />
      <Stack.Screen name="ShopDetail"  component={ShopDetailScreen}  options={({ route }) => ({ title: route.params.shopName })} />
      <Stack.Screen name="BookingFlow" component={BookingFlowScreen} options={{ title: "ยืนยันการจอง" }} />
    </Stack.Navigator>
  );
}

export function CustomerNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomerBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"     component={HomeStack}     />
      <Tab.Screen name="Delivery" component={DeliveryScreen} />
      <Tab.Screen name="Bookings" component={BookingsScreen} />
      <Tab.Screen name="Tracking" component={TrackingScreen} />
      <Tab.Screen name="Rewards"  component={RewardsScreen}  />
    </Tab.Navigator>
  );
}
