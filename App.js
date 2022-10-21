import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, Image, SafeAreaView } from 'react-native';
import TextRecognition from 'react-native-text-recognition';
import {launchCamera, launchImageLibrary} from "react-native-image-picker";
import ActionSheet1 from 'react-native-ui-action-sheet';
import ActionSheet2 from 'react-native-ui-action-sheet';


export default function App() {
    const [text1, setText1] = useState(null);
    const [text2, setText2] = useState(null);
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [compareText, setCompareText] = useState("Need two images to compare");
	const ActionSheetRef1 = useRef();
	const ActionSheetRef2 = useRef();

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
			<View style={styles.header}>
				<Text style={styles.title}>ColdSpring Plate Checking</Text>
			</View>
			{image1?<Image source={{uri: image1.assets[0].uri,}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			{text1?<Text>Recognized text is {text1}</Text>:null}
			<Button title="Add Picture 1" onPress={()=>ActionSheetRef1.current.show()}/>
			<ActionSheet1
				ref={ActionSheetRef1}
				title={'Select a Picture'}
				options={[
					{title: 'Take Picture 1', onPress: () => {launchCamera({}, setImage1)}},
					{title: 'Choose Picture 1 from image library', onPress: () => {launchImageLibrary({}, setImage1)}},
				]}
				cancelTitle="cancel"
			/>
			{image2?<Image source={{uri:image2.assets[0].uri, }} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			{text2?<Text>Recognized text is {text2}</Text>:null}
			<Button title="Add Picture 2" onPress={()=>ActionSheetRef2.current.show()}/>
			<ActionSheet2
				ref={ActionSheetRef2}
				title={'Select a Picture'}
				options={[
					{title: 'Take Picture 2', onPress: () => {launchCamera({}, setImage2)}},
					{title: 'Choose Picture 2 from image library', onPress: () => {launchImageLibrary({}, setImage2)}},
				]}
				cancelTitle="cancel"
			/>
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
		justifyContent: 'space-between',
		flexDirection: 'column',
		marginTop: 62,
	},
	header: {
		backgroundColor: 'royalblue',
		height: 45,
		paddingTop: 10,
		alignSelf: 'stretch',
	},
	title: {
		color: 'white',
		fontSize: 17,
		textAlign: 'center',
		fontWeight: 'bold',
	}
});