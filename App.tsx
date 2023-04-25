import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, StatusBar, ScrollView, Pressable } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import PhotoEditor from '@baronha/react-native-photo-editor';
import ImgToBase64 from 'react-native-image-base64';
import { TabView, Tab } from 'react-native-tab-view-easy';
import { TabBar } from 'react-native-tab-view';
import Diff from "react-native-diff-component";

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
	const response = await fetch(`https://us-vision.googleapis.com/v1/images:annotate?key=API_key`, {
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

function FilteredText(detectedText) {
	const filteredText = detectedText.replace(/[^A-Za-z0-9`~!@#$%^&*()-_=+\[{\]}\|;:'",<.>/?\s]\s|^[^A-Za-z0-9`~!@#$%^&*()-_=+\[{\]}\|;:'",<.>/?\s]$|\b937\s|\b937\b|\+\s|\+|\b1\s|\b1\b|(#[^A-Za-z]*)\s|(GB[^A-Za-z]*)\s|([^A-Za-z]*x[^A-Za-z]*)\s|([^A-Za-z]*X[^A-Za-z]*)\s|\bt\s|\bt\b|\bT\s|\bT\b|\bO\s|\bO\b|\bo\s|\bo\b|(NS[^A-Za-z]*)\s|\$\s|\$|(CF[^A-Za-z]*)\s|\*\s|\*/g, '');
	return filteredText;
}

export default function App() {
	const [text1, setText1] = useState(null);
	const [text2, setText2] = useState(null);
	const [image1, setImage1] = useState(null);
	const [image2, setImage2] = useState(null);
	const [compareText, setCompareText] = useState("Need two images to compare");
	const [buttonImage, setButtonImage] = useState();
	const [scannedImage, setScannedImage] = useState();
	const [imageBase64String, setImageBase64String] = useState();
	const [difference, setDifference] = useState();

	const scanDocument = async () => {
		const { scannedImages } = await DocumentScanner.scanDocument({
			croppedImageQuality: 100,
			maxNumDocuments: 1,
			responseType: 'imageFilePath'
		})

		if (scannedImages.length > 0) {
			setScannedImage(scannedImages[0])
		}
	};

	const renderTabBar = props => (
		<TabBar
			{...props}
			indicatorStyle={{ backgroundColor: 'dodgerblue' }}
			style={{ backgroundColor: 'white', marginBottom: 5 }}
			labelStyle={{ textTransform: 'capitalize', fontSize: 15, fontWeight: 'bold' }}
			activeColor='black'
			inactiveColor='black'
		/>
	);

	useEffect(()=>{
		(async()=>{
			if(scannedImage) {
				try {
					const path = await PhotoEditor.open({
						path: scannedImage,
					});
					if (buttonImage == "buttonImage1") {
						setImage1(path);
					}
					else if (buttonImage == "buttonImage2") {
						setImage2(path);
					}
					ImgToBase64.getBase64String(path)
						.then(base64String => setImageBase64String(base64String))
						.catch(err => console.log(err));
				} catch (e) {
					console.log('e', e);
				}
			}
		})();
	},[scannedImage]);

	useEffect(()=>{
		(async()=>{
			if(imageBase64String) {
				if (buttonImage == "buttonImage1") {
					setText1("loading...");
					const response = await CallGoogleCloudVisionAPI(imageBase64String);
					const detectedText = response.text;
					const filteredText = FilteredText(detectedText);
					setText1(filteredText);
				}
				else if (buttonImage == "buttonImage2") {
					setText2("loading...");
					const response = await CallGoogleCloudVisionAPI(imageBase64String);
					const detectedText = response.text;
					const filteredText = FilteredText(detectedText);
					setText2(filteredText);
				}
			}
		})();
	},[imageBase64String]);

	useEffect(()=>{
		if (text1 != null && text2 != null) {
			if (text1 == "no text recognized on this image." && text2 == "no text recognized on this image.")
			{
				setCompareText("No text recognized on these images!");
				setDifference(false);
			}
			else if (text1.toString() == text2.toString())
			{
				setCompareText("Image text matches!");
				setDifference(false);
			}
			else
			{
				setCompareText("Image text does NOT match.");
				setDifference(true);
			}
		}
	},[text1,text2]);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Coldspring Plate Checking</Text>
			</View>
			<TabView renderTabBar={renderTabBar}>
				<Tab title={'Template'}>
					<View style={styles.image}>
						{image1?<Image source={{uri: image1}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
					</View>
					<View style={styles.recognizedText}>
						{text1?
							<View style={{paddingLeft: 5, paddingRight: 5, paddingTop: 10}}>
								<Text style={{fontWeight: "bold"}}>Recognized text:{"\n"}</Text>
								<ScrollView>
									<Text>{text1}</Text>
								</ScrollView>
							</View>
						:null}
					</View>
					<Pressable
						onPress={() => {
						scanDocument();
						setButtonImage("buttonImage1");
					}}>
						<Text style={styles.button}>Add Template</Text>
					</Pressable>
				</Tab>

				<Tab title={'Plate'}>
					<View style={styles.image}>
						{image2?<Image source={{uri: image2}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
					</View>
					<View style={styles.recognizedText}>
						{text2?
							<View style={{paddingLeft: 5, paddingRight: 5, paddingTop: 10}}>
								<Text style={{fontWeight: "bold"}}>Recognized text:{"\n"}</Text>
								<ScrollView>
									<Text>{text2}</Text>
								</ScrollView>
							</View>
						:null}
					</View>
					<Pressable
						onPress={() => {
						scanDocument();
						setButtonImage("buttonImage2");
					}}>
						<Text style={styles.button}>Add Plate</Text>
					</Pressable>
				</Tab>

				<Tab title={'Result'}>
					<Text style={{color: text1 && text2 && text1.toString() == text2.toString() ? 'green':'red', fontSize:30, textAlign:'center'}}>{compareText}</Text>
					{difference?
						<View style={styles.differentTexts}>		
							<View style={styles.plateDifferentText}>
								{text1 && text2?
									<View style={{paddingLeft: 5, paddingRight: 5, paddingTop: 10}}>
										<Text style={{fontWeight: "bold"}}>Plate is different from Template:{"\n"}</Text>
										<ScrollView>
											<Diff inputA={text1.replace(/\n/g, ' ')} inputB={text2.replace(/\n/g, ' ')} type="words" />
										</ScrollView>
									</View>
								:null}
							</View>
							<View style={styles.templateDifferentText}>
								{text2 && text1?
									<View style={{paddingLeft: 5, paddingRight: 5, paddingTop: 10}}>
										<Text style={{fontWeight: "bold"}}>Template is different from Plate:{"\n"}</Text>
										<ScrollView>
											<Diff inputA={text2.replace(/\n/g, ' ')} inputB={text1.replace(/\n/g, ' ')} type="words" />
										</ScrollView>
									</View>
								:null}
							</View>
						</View>
					:false}
					<StatusBar style="auto"/>
				</Tab>
			</TabView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
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
	image: {
		flex: 1,
	},
	recognizedText: {
		flex: 1.3,
		paddingBottom: 78,
	},
	button: {
		color: 'black',
		fontWeight: 'bold',
		fontSize: 15,
		borderRadius: 6,
		backgroundColor : 'lightskyblue',
		textAlign: 'center',
		paddingLeft : 12,
		paddingRight : 12,
		paddingBottom : 6,
		paddingTop: 6,
		alignSelf: 'center',
		position: 'absolute',
		bottom: 5,
	},
	differentTexts: {
		flex: 1,
	},
	plateDifferentText: {
		flex: 1,
		paddingBottom: 45,
	},
	templateDifferentText: {
		flex: 1.2,
	},
});