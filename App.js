import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';

import TextRecognition from 'react-native-text-recognition';

import {launchCamera, launchImageLibrary} from "react-native-image-picker";


export default function App() {
    const [text1, setText1] = useState(null);
    const [text2, setText2] = useState(null);
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [compareText, setCompareText] = useState("Need two images to compare");


    useEffect(()=>{
        if (text1 != null && text2 != null) {
            if (text1.toString() == text2.toString())
            {
                setCompareText("Image text matches!");
            }
            else
            {
                setCompareText("Image text does NOT match");
            }
        }
    },[text1,text2]);

    useEffect(()=>{
        (async()=>{
            if(image1)
            {
                const result = await TextRecognition.recognize(image1.assets[0].uri);
                console.log(image1);
                console.log(result);
                setText1(result);
            }
        })();
    },[image1]);
    useEffect(()=>{
        (async()=>{
            if(image2)
            {
                const result = await TextRecognition.recognize(image2.assets[0].uri);
                console.log(image2);
                console.log(result);
                setText2(result);
            }
        })();
    },[image2]);


  return (
    <View style={styles.container}>
        {image1?<Image source={{uri: image1.assets[0].uri,}} style={{height:200, width:200}}/>:null}
        <Button title="Take Picture 1" onPress={()=>{launchCamera({}, setImage1)}}/>
        <Button title="Choose Picture 1 from image library" onPress={()=>{launchImageLibrary({}, setImage1)}}/>
      {text1?<Text>Recognized text is {text1}</Text>:null}
        {image2?<Image source={{uri:image2.assets[0].uri, }} style={{height:200, width:200}}/>:null}
        <Button title="Take Picture 2" onPress={()=>{launchCamera({}, setImage2)}}/>
        <Button title="Choose Picture 2 from image library" onPress={()=>{launchImageLibrary({}, setImage2)}}/>
        {text2?<Text>Recognized text is {text2}</Text>:null}
        <Text style={{color: text1 && text2 && text1.toString() == text2.toString() ? 'green':'red', fontSize:30, textAlign:'center'}}>{compareText}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
