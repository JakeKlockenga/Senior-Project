import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, Image, StatusBar } from 'react-native';
import {launchCamera, launchImageLibrary} from "react-native-image-picker";
import ActionSheet1 from 'react-native-ui-action-sheet';
import ActionSheet2 from 'react-native-ui-action-sheet';


async function CallGoogleCloudVisionAPI(image) {
	const body = {
		"requests": [
			{
				"image": {
					"content": image
				},
				"features": [
					{
						"type": "TEXT_DETECTION", 
						"maxResults": 1
					}
				]
			}
		]
	};
	const response = await fetch(`https://us-vision.googleapis.com/v1/images:annotate?key=`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	const result = await response.json();
	const recognizedText = result.responses[0].fullTextAnnotation;
	console.log("recognizedText.text: ", recognizedText.text);
	const textArray = [];
	recognizedText.pages[0].blocks[0].paragraphs[0].words.forEach(word =>
	{ //this is taking the words for the first block of text recognized -- there will be multiple blocks per picture
		let wordArray = [];
		// this is the bounding box for the word
		console.log("Bounding box vertices for word: ",word.boundingBox.vertices);
		// word is not listed in this object as whole, but instead as separate "symbols" which are letters in most cases
		word.symbols.forEach(letter =>
		{ //adding each letter to an array so that we can reconstruct them into a word
			wordArray.push(letter.text);
		})
		//regex to remove commas separating letters in array after converting it to a string thus leaving only the word
		let finalWord = wordArray.toString().replace(/\,/g,'')
		let wordObject =
			{
				vertices: word.boundingBox.vertices,
				word: finalWord
			}
		textArray.push(wordObject);
	})
	//console.log("recognizedText.pages[0].blocks: ",recognizedText.pages[0].blocks[0].paragraphs[0].words);
	//above is the array of words per "paragraph".  If we run through each element in this array, it will be each words in the paragraph
	//we will need to then look at the bounding box of each element in this array which will be the bounding box of each word
	return recognizedText ? recognizedText : {text: "no text recognized on this image."};
}

export default function App() {
	const [text1, setText1] = useState(null);
	const [text2, setText2] = useState(null);
	const [image1, setImage1] = useState(null);
	const [image2, setImage2] = useState(null);
	const [compareText, setCompareText] = useState("Need two images to compare");
	const ActionSheetRef1 = useRef();
	const ActionSheetRef2 = useRef();
	const noise = [];

	useEffect(()=>{
		if (text1 != null && text2 != null && text1 != "loading..." && text2 != "loading...") {
			if (text1 == "no text recognized on this image." && text2 == "no text recognized on this image.")
			{
				setCompareText("No text recognized on these images!");
			}
			else if (text1.toString() == text2.toString())
			{
				setCompareText("Image text matches!");
			}
			else
			{
				setCompareText("Image text does NOT match");
			}
			const splitText1 = text1.split(/\s/);
			const splitText2 = text2.split(/\s/);
			const matches = [];
			splitText1.forEach(word =>
			{
				let matched = false;
				if (word.includes(",") || word.includes("."))
				{
					word = word.substring(0,word.length-1);
				}
				splitText2.forEach(word2 =>
				{
					if (word2.includes(",") || word2.includes("."))
					{
						word2 = word2.substring(0,word2.length-1);
					}

					if (word == word2)
					{
						matched = true;
						matches.push(word);
					}
				})
				if (!matched)
				{
					noise.push(word);
				}
			})
			console.log("matches: ",matches.flat());
			console.log("noise: ",noise.flat());
		}
	},[text1,text2]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>ColdSpring Plate Checking</Text>
			</View>
			<Text style={{fontSize: 3,}}>{' '}</Text>
			{image1?<Image source={{uri: image1}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			{/*<View style={{width: 391}}>
				{text1?<Text>Recognized text is {text1}</Text>:null}
			</View>*/}
			<View style={{padding: 5,}}>
				<Button title="Add Set Plate" onPress={()=>ActionSheetRef1.current.show()}/>
			</View>
			<ActionSheet1
				ref={ActionSheetRef1}
				title={'Select a Picture'}
				options={[
					{title: 'Take Picture 1', onPress: async () => {
						let result = await launchCamera({
							includeBase64: true
						});
						setImage1(result.assets[0].uri);
						const response = await CallGoogleCloudVisionAPI(result.assets[0].base64);
						setText1(response.text);
					}},
					{title: 'Choose Picture 1 from image library', onPress: async () => {
						let result = await launchImageLibrary({
							includeBase64: true
						});
						setImage1(result.assets[0].uri);
						setText1("loading...");
						const response = await CallGoogleCloudVisionAPI(result.assets[0].base64);
						setText1(response.text);
					}},
				]}
				cancelTitle="cancel"
			/>
			{image2?<Image source={{uri:image2}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			{/*<View style={{width: 391}}>
				{text2?<Text>Recognized text is {text2}</Text>:null}
			</View>*/}
			<View style={{padding: 5,}}>
				<Button title="Add Design Template" onPress={()=>ActionSheetRef2.current.show()}/>
			</View>
			<ActionSheet2
				ref={ActionSheetRef2}
				title={'Select a Picture'}
				options={[
					{title: 'Take Picture 2', onPress: async () => {
						let result = await launchCamera({
							includeBase64: true
						});
						setImage2(result.assets[0].uri);
						const response = await CallGoogleCloudVisionAPI(result.assets[0].base64);
						setText2(response.text);
					}},
					{title: 'Choose Picture 2 from image library', onPress: async () => {
						let result = await launchImageLibrary({
							includeBase64: true
						});
						setImage2(result.assets[0].uri);
						setText2("loading...");
						const response = await CallGoogleCloudVisionAPI(result.assets[0].base64);
						setText2(response.text);
					}},
				]}
				cancelTitle="cancel"
			/>
			<Text style={{color: text1 && text2 && text1.toString() == text2.toString() ? 'green':'red', fontSize:30, textAlign:'center'}}>{compareText}</Text>
			{noise ? noise.map(word=><Text>word</Text>) : null}
			<StatusBar style="auto"/>
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