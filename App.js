import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState, Component} from 'react';
import BLEManager from "react-native-ble-manager";
import {
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Switch,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const BLEManagerModule = NativeModules.BLEManager;
const BLEManagerEmitter = new NativeEventEmitter(BLEManagerModule);

const Stack = createStackNavigator();

if (Platform.OS === 'android' && Platform.Version >= 23) {
  PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
      if (result) {
        console.log("Permission is OK");
      } else {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
          if (result) {
            console.log("User accept");
          } else {
            console.log("User refuse");
          }
        });
      }
});
}

function Questions({ navigation }) {
  
  const [isEnabled1, SetEnabled1] = useState(false);
  const [isEnabled2, SetEnabled2] = useState(false);
  const [isEnabled3, SetEnabled3] = useState(false);

  return (
    <>
      <StatusBar barStyle="default" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>

          <View style={styles.body}>
            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Question 1</Text>
              
              <Switch
              style={styles.switchStyle}
              value={isEnabled1}
              onValueChange={SetEnabled1}
              />

            </View>

            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Question 2</Text>
              
              <Switch
              style={styles.switchStyle}
              value={isEnabled2}
              onValueChange={SetEnabled2}
              />

            </View>

            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Question 3</Text>
              
              <Switch
              style={styles.switchStyle}
              value={isEnabled3}
              onValueChange={SetEnabled3}
              />

            </View>

            <View style={styles.buttonStyle}>
              <Button 
              style={styles.buttonStyle}
              title="Submit"
              onPress={()=>navigation.navigate('Main')}
              />
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Main({ navigation }) {
  return (
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32}}>
        <Text style={styles.sectionDescription}>Nearest Stationary Device </Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
  <Text style={styles.sectionDescription} onPress={() => console.log(BLEManager.enableBluetooth)}>Bluetooth is {}</Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 50}}>
        <Text style={styles.sectionDescription} onPress={() => navigation.navigate('Questions')}>Have you been tested for Covid-19 and tested positive? Click Here</Text>
      </View>
    </>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Questions">
        <Stack.Screen name="Questions" component={Questions} options={{headerLeft: null, headerTitleAlign: 'center', title: 'Covid-19 Questions'}} />
        <Stack.Screen name="Main" component={Main} options={{headerTitleAlign: 'center', headerLeft: null, title: 'Bluetooth Tracing'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/*const App: () => React$Node = ({Navigation}) => {

  <NavigationContainer>

      <Stack.Navigator>
        <Stack.Screen
          name="Questions"
          component={App}
          />
      </Stack.Navigator>

      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={Main}
          />
      </Stack.Navigator>

    </NavigationContainer>  
};
*/
const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
    flex: 1,
    flexDirection: 'row',
  },
  switchStyle: {

    flex: 1,

  },
  buttonStyle: {

    paddingHorizontal: 24,
    marginTop: 50,

  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
    textAlign: "center",
    borderRadius: 5,
    borderWidth: 2,
    
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});



export default App;
