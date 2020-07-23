import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, {useState, Component, useEffect, createContext} from 'react';
import BLEManager from "react-native-ble-manager";
import AsyncStorage from '@react-native-community/async-storage';
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
  Alert,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { TextInput } from 'react-native-gesture-handler';

const BLEManagerModule = NativeModules.BLEManager;
const BLEManagerEmitter = new NativeEventEmitter(BLEManagerModule);

global.PotentialCarrier = null;
global.CheckP;

BLEManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => 
    {
      console.log(data) // Name of peripheral device
    });

BLEManager.start({showAlert: false}).catch((error) => {
  console.log(error);
});

const Stack = createStackNavigator();

if (Platform.OS === 'android' && Platform.Version >= 23) {
  PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
      if (result) {
        //console.log("Permission is OK");
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

BLEManager.scan([], 5).catch((error) => {});

BLEManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {

  console.log(peripheral);
  
});

async function storeData() {
  try {
    await AsyncStorage.setItem('@PotentialCarrier', PotentialCarrier.toString());
  } catch (error) {
    console.log(error);
  }
};

async function getData() {
  try {
    const value = await AsyncStorage.getItem('@PotentialCarrier');
    if(value !== null) {
      PotentialCarrier = value;
    }
  } catch(e) {
    console.log(e)
  }
}

function Questions({ navigation }) {
  
  const [TestedCovid, SetEnabled1] = useState(false);
  const [ContactCovid, SetEnabled2] = useState(false);
  const [FeelingIll, SetEnabled3] = useState(false);

  getData;

  getCheckP('https://shrouded-meadow-59669.herokuapp.com/checkpoint/CAA63B87-DA1E-488B-BD8B-C5E04FE06EC2');

  return (
    <>
      <StatusBar barStyle="default" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>

          <View style={styles.body}>
            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Have you ever tested positive for Covid-19?</Text>
              
              <Switch
              style={styles.switchStyle}
              value={TestedCovid}
              onValueChange={SetEnabled1}
              />

            </View>

            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Have you ever been in contact with someone who has tested positive with Covid-19?</Text>
              
              <Switch
              style={styles.switchStyle}
              value={ContactCovid}
              onValueChange={SetEnabled2}
              />

            </View>

            <View style={styles.sectionContainer}>

              <Text style={styles.sectionTitle}>Are you feeling ill?</Text>
              
              <Switch
              style={styles.switchStyle}
              value={FeelingIll}
              onValueChange={SetEnabled3}
              />

            </View>

            <View style={styles.buttonStyle}>
              <Button 
              style={styles.buttonStyle}
              title="Submit"
              onPress={()=>{
                if (TestedCovid || ContactCovid || FeelingIll) {
                  PotentialCarrier = true
                } else {
                  PotentialCarrier = false
                }
                storeData();
                navigation.navigate('Main')
              }
             }
              />
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function Main({ navigation }) {

  const [BLEEnabled, SetBLE] = useState("disabled");
  const [TextVal, setTextVal] = useState();
  const [epoch, setEpoch] = useState(200);

  getData();

  BLEManagerEmitter.addListener("BleManagerDidUpdateState", (args) => {
    SetBLE("disabled");
  });

  BLEManager.enableBluetooth().then(() => {
    SetBLE("enabled");
  }).catch((error) => {
    Alert.alert('You need to enable bluetooth to use this app.');
    console.log(error + ' TEST');
  });

  const nearestCP = CheckP.guid_;

  return (
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32}}>
        <Text style={styles.sectionDescription}>{'Nearest Stationary Device\n' + CheckP.guid_}</Text>
        <Button 
              style={styles.buttonStyle}
              title="Check"
              onPress={()=>{
                if (PotentialCarrier == 'true') {
                  ReportExposed(nearestCP)
                } else {
                  CheckExposed(nearestCP, epoch)
                }
              }
             }
              />
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
        <Text style={styles.sectionDescription} onPress={() => BLEManager.enableBluetooth().catch((error) => Alert.alert(error))}>Bluetooth is {BLEEnabled}</Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 50}}>
        <Text style={styles.sectionDescription} onPress={() => navigation.navigate('Questions')}>Have you been tested for Covid-19 and tested positive? Click Here</Text>
      </View>
    </>
  );

}

async function getCheckP(URL) {
  try {
    let response = await fetch(
      URL, 
    );
    let responseJson = await response.json();
    CheckP = responseJson;
  } catch (error) {
    console.error(error);
  }
}

async function CheckExposed(GUID, epoch) {
  try {
    let response = await fetch(
      'https://shrouded-meadow-59669.herokuapp.com/exposedcheckpoint/' + GUID, 
    );
    let responseJson = await response.json();
      if (responseJson.reverse()[0].epoch == epoch) {
        Alert.alert("Recent Exposure", "You have been in an area where a potential carrier has recently been.  Covid-19 Testing is advised.")
      };
  } catch (error) {
    console.error(error);
  }
}

async function ReportExposed(GUID) {

    await fetch(
      'https://shrouded-meadow-59669.herokuapp.com/report', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          guid: GUID,
          epoch: 200,
      }),
    });
  }

function App() {

  var MainView = "Questions";

  if (PotentialCarrier != null) {
    MainView = "Main";
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={MainView}>
        <Stack.Screen name="Questions" component={Questions} options={{headerLeft: null, headerTitleAlign: 'center', title: 'Covid-19 Questions'}} />
        <Stack.Screen name="Main" component={Main} options={{headerTitleAlign: 'center', headerLeft: null, title: 'Bluetooth Tracing'}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

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
    flexDirection: 'row',
  },
  switchStyle: {

    flex: 1,

  },
  buttonStyle: {

    marginHorizontal: 50,
    marginTop: 50,
    marginBottom: 50,
    flex: 1

  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    flex: 2,
  },
  sectionDescription: {
    marginTop: 8,
    marginBottom: 10,
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
