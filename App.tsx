import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button, Image, StatusBar } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';

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
	const response = await fetch(`https://us-vision.googleapis.com/v1/images:annotate?key=${"API_key"}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});
	const result = await response.json();
	const recognizedText = result.responses[0].fullTextAnnotation;
	return recognizedText ? recognizedText : {text: "no text recognized on this image."};
}

export default function App() {
	const [text1, setText1] = useState(null);
	const [text2, setText2] = useState(null);
	const [image1, setImage1] = useState(null);
	const [image2, setImage2] = useState(null);
	const [compareText, setCompareText] = useState("Need two images to compare");
	const [buttonImage, setButtonImage] = useState();
	const [scannedImage, setScannedImage] = useState();
	const scanDocument = async () => {
		const { scannedImages } = await DocumentScanner.scanDocument({
			croppedImageQuality: 100,
			maxNumDocuments: 1,
			responseType: 'base64'
		})
		
		if (scannedImages.length > 0) {
			setScannedImage(scannedImages[0])
		}
	}

    useEffect(()=>{
        (async()=>{
			if(scannedImage) {
				try {
					if (buttonImage == "buttonImage1") {
						setImage1(scannedImage);
						setText1("loading...");
						const response = await CallGoogleCloudVisionAPI(scannedImage);
						setText1(response.text);
					}
					else if (buttonImage == "buttonImage2") {
						setImage2(scannedImage);
						setText2("loading...");
						const response = await CallGoogleCloudVisionAPI(scannedImage);
						setText2(response.text);
					}
				} catch (e) {
					console.log('e', e);
				}
			}
		})();
	},[scannedImage]);

	useEffect(()=>{
		if (text1 != null && text2 != null) {
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
		}
	},[text1,text2]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>ColdSpring Plate Checking</Text>
			</View>
			<Text style={{fontSize: 3,}}>{' '}</Text>
			{image1?<Image source={{uri: "data:image/jpg;base64,"+image1}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			<View style={{width: 391}}>
				{text1?<Text>Recognized text is {text1}</Text>:null}
			</View>
			<View style={{padding: 5,}}>
				<Button title="Add Picture 1" onPress={()=> {
				scanDocument();
				setButtonImage("buttonImage1");
				}}/>
			</View>
			{image2?<Image source={{uri: "data:image/jpg;base64,"+image2}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			<View style={{width: 391}}>
				{text2?<Text>Recognized text is {text2}</Text>:null}
			</View>
			<View style={{padding: 5,}}>
				<Button title="Add Picture 2" onPress={()=> {
				scanDocument();
				setButtonImage("buttonImage2");
				}}/>
			</View>
			<Text style={{color: text1 && text2 && text1.toString() == text2.toString() ? 'green':'red', fontSize:30, textAlign:'center'}}>{compareText}</Text>
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
	},
});