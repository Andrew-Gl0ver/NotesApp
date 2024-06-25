import React, { useState, useLayoutEffect} from 'react';
import { TextInput, TouchableOpacity, View, Text, Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import tw, { useDeviceContext } from 'twrnc';
import { Provider } from 'react-redux';
import { store } from './store';
import MasonryList from '@react-native-seoul/masonry-list';
import { useSearchNotesQuery, useAddNoteMutation, useDeleteNoteMutation, useUpdateNoteMutation } from './db';

/* 
Homescreen includes all search and add functions of the notes app. 
Click on a note to open the edit screen.
*/
function HomeScreen({ navigation }) {
  // Hooks used in homescreen
  const [searchQuery, setSearchQuery] = useState('');
  const { data: searchData} = useSearchNotesQuery('');
  const [ addNote, { data: addNoteData, }] = useAddNoteMutation(); 

  // Navigate to add screen if new note
  useLayoutEffect(() => {
    if (addNoteData != null) {
      navigation.navigate("AddEditNote", { data:  addNoteData });
    }
  }, [addNoteData]);

  // layout for each note item in the list
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('AddEditNote', { data: item })} 
      style={tw`w-[90%] mb-4 bg-white rounded-sm p-4 self-center`}>
      <Text style={tw`text-xl`}>{item.title}</Text>
      <Text style={tw`text-base mt-2`}>{item.content}</Text>
    </TouchableOpacity>
  );

  // filters based on user search 
  const filteredData = searchData?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Homescreen visuals
  return (
    <View style={tw`flex-1 items-center justify-center bg-yellow-100`}>
      <TextInput
        style={tw`bg-white p-2 rounded mb-5 mt-5 w-[86%] mx-auto`}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}/>
      {filteredData ? 
        // Masonry list containing each user inputted element/note
        <MasonryList
          style={tw`p-2`}
          data={filteredData}
          numColumns={2}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}/>  
        : <></>
        // Add note button provided from shiftkey notes slides
      } 
      <TouchableOpacity onPress={() => { addNote({ title: "", content:  "" }); }} style={tw`bg-yellow-300 rounded-full absolute bottom-[5%] right-8 mx-auto items-center flex-1 justify-center w-12 h-12`}>
        <Text style={tw`text-white rounded-sm text-center text-3xl mt--1`}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

/* 
AddEditNoteScreen includes all adding and editing functions of the notes app. 
Add/Edit the note's title, content, or delete the note entirely
*/
function AddEditNoteScreen({ route, navigation }) {

  // States + Hooks used in Add/Edit Screen
  const note = route.params?.data;
  const [title, setTitle] = useState(note ? note.title : '');
  const [content, setContent] = useState(note ? note.content : '');
  const [addNote] = useAddNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  // Handles autocorrect on editing titles
  const handleChangedTitle = (text) => {
    setTitle(text);
    updateNote({
      id: note.id,
      title: text,        
      content: content,
      })
  };

  // Handles autocorrect on editing note content
  const handleChangedContent = (text) => {
    setContent(text);
    updateNote({
      id: note.id,
      title: title,        
      content: text,
      })
  };

  // Handles note deletion
  const handleDelete = () => {
    // !! SPECIAL FEATURE !! Alerts confirming deletion for both mobile and web
    if (Platform.OS === 'web') {
      // Web confirmation
      if (window.confirm("Are you sure you want to delete this note?")) {
        if (note) {
          deleteNote(note);
        }
        navigation.goBack(); // go back to homescreen
      }
    } else {
      // Mobile confirmation
      Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note?",
        [{
          text: "Cancel", style: "cancel"
        }, {
          text: "Delete", style: "destructive",
          onPress: () => {
            if (note) {
              deleteNote(note);
            }
            navigation.goBack(); // go back to homescreen
          }
        }]
      );
    }
  };

  // Sets navigation options based on whether it's an Add or Edit
  useLayoutEffect(() => {
    navigation.setOptions({
      title: note ? 'Notes' : 'Add Note',
      headerRight: () => (note ? (
        // Adds delete text in top right that sends to the delete handling function
        <TouchableOpacity onPress={handleDelete} style={tw`mr-4`}>
          <Text style={tw`text-red-500`}>Delete</Text>
        </TouchableOpacity>
      ) : null),
    });
  }, [navigation, note]);

  // Editscreen visuals
  return (
    <View style={tw`items-center flex-1 p-4 bg-yellow-100`}>
      <TextInput
        style={tw`bg-white p-2 rounded w-[88] mb-2`}
        placeholder="Title"
        value={title}
        onChangeText={handleChangedTitle}
      />
      <TextInput
        style={tw`bg-white p-2 rounded w-[88] mb-8`}
        placeholder="Content"
        value={content}
        onChangeText={handleChangedContent}
        multiline
      />
    </View>
  );
}

const Stack = createNativeStackNavigator();

// Call App's default function
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
