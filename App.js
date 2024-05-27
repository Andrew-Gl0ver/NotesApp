// testing git updates

import { useEffect } from 'react';
import { Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function HomeScreen({ navigation }) {
  return (
    <View style={tw`flex-1 items-center justify-center bg-purple-400`}>
      <Text style={tw`text-lg mb-4 text-white`}>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
      />
    </View>
  );
}

function DetailsScreen({ navigation }) {
  useEffect(() => {
    navigation.setOptions({ title: getRandomInt(0, 100)});
  }, []);

  return (
    <View style={tw`flex-1 items-center justify-center bg-purple-400`}>
      <Text style={tw`text-lg text-white`}>Details Screen</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

function App() {
  useDeviceContext(tw);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
            options={{
              headerStyle: tw`bg-purple-300 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
              headerRight: () => ( <Button onPress={() => { console.log("hey"); }} title="Button" color="#000"/> )
            }}
          name="Home" component={HomeScreen} />
        <Stack.Screen 
            options={{
              headerStyle: tw`bg-purple-300 border-0`,
              headerTintColor: '#fff',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
          name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
