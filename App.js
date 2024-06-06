import React, { useState, useLayoutEffect } from 'react';
import { TextInput, TouchableOpacity, View, Text, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list';
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db'; // Ensure these hooks are correctly imported

function HomeScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchData} = useSearchNotesQuery('');

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('AddEditNote', { data: item })} 
      style={tw`w-[90%] mb-4 bg-white rounded-sm p-4 self-center`}>
      <Text style={tw`text-xl`}>{item.title}</Text>
      <Text style={tw`text-base mt-2`}>{item.content}</Text>
    </TouchableOpacity>
  );

  const filteredData = searchData?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={tw`flex-1 items-center justify-center bg-yellow-100`}>
      <TextInput
        style={tw`bg-white p-2 rounded mb-5 mt-5 w-[86%] mx-auto`}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}/>
      {filteredData ? 
        <MasonryList
          style={tw`p-2`}
          data={filteredData}
          numColumns={1}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}/>  
        : <></>
      }
      <TouchableOpacity onPress={() => navigation.navigate('AddEditNote')} style={tw`bg-yellow-300 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white rounded-sm text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddEditNoteScreen({ route, navigation }) {
  const note = route.params?.data;
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');
  const [addNote] = useAddNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  const handleSubmit = () => {
    if (title && content) {
      if (note) {
        // Update existing note
        updateNote({ id: note.id, title, content});
      } 
      else {
        // Add new note
        addNote({title, content});
      }
      navigation.goBack(); // Navigate back to the home screen
    } 
    else {
      alert('Please enter both title and content');
    }
  };

  const handleDelete = () => {
    // !! SPECIAL FEATURE !! Alerts confirming deletion for both mobile and web
    if (Platform.OS === 'web') {
      // Web confirmation
      if (window.confirm("Are you sure you want to delete this note?")) {
        if (note) {
          deleteNote(note);
        }
        navigation.goBack(); // Navigate back to the home screen
      }
    } 
    else {
      // Mobile confirmation
      Alert.alert(
         "Delete Note",
         "Are you sure you want to delete this note?",
           [{text: "Cancel", style: "cancel"}, {text: "Delete", style: "destructive",
                onPress: () => {
                  if (note) {
                    deleteNote(note);
                 }
                 navigation.goBack(); // Navigate back to the home screen
            }}]
       );
    }
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: note ? 'Edit Note' : 'Add Note',
      headerRight: () => (note ? (
          <TouchableOpacity onPress={handleDelete} style={tw`mr-4`}>
            <Text style={tw`text-red-500`}>Delete</Text>
          </TouchableOpacity>
        ) : null
      ),
    });
  }, [navigation, note]);

  return (
    <View style={tw`items-center flex-1 p-4 bg-yellow-100`}>
      <TextInput
        style={tw`bg-white p-2 rounded w-[88] mb-2`}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={tw`bg-white p-2 rounded w-[88] mb-8`}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity
        onPress={handleSubmit}
        style={tw`bg-yellow-300 rounded p-3 w-[30] items-center`}
      >
        <Text style={tw`text-white`}>{note ? 'Update Note' : 'Add Note'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  useDeviceContext(tw);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            options={{
              headerStyle: tw`bg-yellow-100 border-0`,
              headerTintColor: '#000',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen
            options={{
              headerStyle: tw`bg-yellow-100 border-0`,
              headerTintColor: '#000',
              headerTitleStyle: tw`font-bold`,
              headerShadowVisible: false, // gets rid of border on device
            }}
            name="AddEditNote"
            component={AddEditNoteScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
