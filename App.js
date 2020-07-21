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

const BLEManagerModule = NativeModules.BLEManager;
const BLEManagerEmitter = new NativeEventEmitter(BLEManagerModule);

BLEManagerEmitter.addListener('BleManagerDiscoverPeripheral',(data) => 
    {
      console.log(data) // Name of peripheral device
    });

BLEManager.start({showAlert: false});

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

BLEManager.scan([], 5)

BLEManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {

  console.log(peripheral);
  
});

const storeData = async () => {
  try {
    await AsyncStorage.setItem('@PotentialCarrier', PotentialCarrier);
  } catch (error) {
    alert("Error");
  }
};

const getData = async () => {
  try {
    const value = await AsyncStorage.getItem('@PotentialCarrier');
    if(value !== null) {
      PotentialCarrier = value;
    }
  } catch(e) {
    alert("Error")
  }
}

function Questions({ navigation }) {
  
  const [TestedCovid, SetEnabled1] = useState(false);
  const [ContactCovid, SetEnabled2] = useState(false);
  const [isEnabled3, SetEnabled3] = useState(false);

  useEffect(() => {
    getData()
  }, [])

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
              onPress={()=>{
                storeData;
                if (TestedCovid) {
                PotentialCarrier = true; navigation.navigate('Main')
              } else if (ContactCovid) {
                PotentialCarrier = true; navigation.navigate('Main')
              } else if (TestedCovid && ContactCovid) {
                PotentialCarrier = true; navigation.navigate('Main')
              }
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

global.CheckP;

function Main({ navigation }) {

  const [BLEEnabled, SetBLE] = useState("disabled");

  BLEManagerEmitter.addListener("BleManagerDidUpdateState", (args) => {
    SetBLE("disabled");
  });

  BLEManager.enableBluetooth().then(() => {
    SetBLE("enabled");
  })
  .catch((error) => {
    Alert.alert('You need to enable bluetooth to use this app.');
    console.log(error)
  });

  getCheckP('https://vktpfvnh04.execute-api.us-east-1.amazonaws.com/covid-checkpoint-1');

  return (
    <>
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 32}}>
        <Text style={styles.sectionDescription}>{'Nearest Stationary Device\n' + CheckP.tempID}</Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-start'}}>
        <Text style={styles.sectionDescription} onPress={() => BLEManager.enableBluetooth()}>Bluetooth is {BLEEnabled}</Text>
      </View>

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 50}}>
        <Text style={styles.sectionDescription} onPress={() => navigation.navigate('Questions')}>Have you been tested for Covid-19 and tested positive? Click Here</Text>
      </View>
    </>
  );

}


global.PotentialCarrier = null;

async function getCheckP(URL) {
  try {
    let response = await fetch(
      URL, 
    );
    let responseJson = await response.json();
    //console.log(responseJson);
    CheckP = responseJson;
  } catch (error) {
    console.error(error);
  }
}

function App() {

  const MainView = "Questions";

  if (PotentialCarrier != null) {
    MainView = "Main";
  }

  console.log(PotentialCarrier + " " + MainView);

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

    paddingHorizontal: 24,
    marginTop: 50,

  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
    flex: 2,
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
