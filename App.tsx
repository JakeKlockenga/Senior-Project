import 'react-native-gesture-handler';
import React, {useState, useEffect, useRef} from 'react';
import { StyleSheet, Text, View, Button, Image, TouchableOpacity, PermissionsAndroid, Alert, Platform, StatusBar } from 'react-native';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import {launchCamera, launchImageLibrary} from "react-native-image-picker";
import ActionSheet1 from 'react-native-ui-action-sheet';
import ActionSheet2 from 'react-native-ui-action-sheet';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ColorMatrix, concatColorMatrices, contrast, saturate, brightness, grayscale } from 'react-native-color-matrix-image-filters'
import {captureRef} from 'react-native-view-shot';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import ActionSheet3 from 'react-native-ui-action-sheet';


function MainScreen() {
	const [text1, setText1] = useState(null);
	const [text2, setText2] = useState(null);
	const [image1, setImage1] = useState(null);
	const [image2, setImage2] = useState(null);
	const [compareText, setCompareText] = useState("Need two images to compare");
	const ActionSheetRef1 = useRef();
	const ActionSheetRef2 = useRef();

    useEffect(()=>{
        if (text1 != null && text2 != null) {
            if (JSON.stringify(text1.text).replace(/\\n/g, ' ') == JSON.stringify(text2.text).replace(/\\n/g, ' '))
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
			<Text style={{fontSize: 3,}}>{' '}</Text>
			{image1?<Image source={{uri: image1.assets[0].uri,}} style={{flex: 1, width: '100%', height: '100%', resizeMode: 'contain',}}/>:null}
			<View style={{width: 391}}>
			{text1?<Text>Recognized text is {JSON.stringify(text1.text).replace(/\\n/g, ' ')}</Text>:null}
			</View>
			<View style={{padding: 5,}}>
				<Button title="Add Picture 1" onPress={()=>ActionSheetRef1.current.show()}/>
			</View>
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
			<View style={{width: 391}}>
			{text2?<Text>Recognized text is {JSON.stringify(text2.text).replace(/\\n/g, ' ')}</Text>:null}
			</View>
			<View style={{padding: 5,}}>
				<Button title="Add Picture 2" onPress={()=>ActionSheetRef2.current.show()}/>
			</View>
			<ActionSheet2
				ref={ActionSheetRef2}
				title={'Select a Picture'}
				options={[
					{title: 'Take Picture 2', onPress: () => {launchCamera({}, setImage2)}},
					{title: 'Choose Picture 2 from image library', onPress: () => {launchImageLibrary({}, setImage2)}},
				]}
				cancelTitle="cancel"
			/>
			<Text style={{color: text1 && text2 && JSON.stringify(text1.text).replace(/\\n/g, ' ') == JSON.stringify(text2.text).replace(/\\n/g, ' ') ? 'green':'red', fontSize:30, textAlign:'center'}}>{compareText}</Text>
			<StatusBar style="auto"/>
		</View>
	);
}

function ImageFilterScreen() {
	const viewRef = useRef();
	const [image1, setImage1] = useState(null);
	const ActionSheetRef3 = useRef();

	const getPermissionAndroid = async () => {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
			);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				return true;
			}
		} catch (error) {
			console.log('error', error);
		}
	};
	
	const saveImage = async () => {
		try {
			const uri = await captureRef(viewRef, {
				format: 'jpg',
				quality: 1.0,
			});
			if (Platform.OS === 'android') {
				const granted = await getPermissionAndroid();
				if (!granted) {
					return;
				}
			}
			const image = CameraRoll.save(uri, 'photo');
			if (image) {
				Alert.alert(
					'',
					'The image has been saved successfully.',
					[{text: 'OK'}]
				);
			}
		} catch (error) {
			console.log('error', error);
		}
	};

	return (
		<>
			<View style={styles.container1} ref={viewRef}>
				<ColorMatrix matrix={concatColorMatrices(grayscale(1))}>
					{image1?<Image source={{uri: image1.assets[0].uri,}} style={styles.image}/>:null}
				</ColorMatrix>
			</View>
			<View style={styles.row}>
				<TouchableOpacity style={styles.button1} onPress={()=>ActionSheetRef3.current.show()}>
					<Text style={styles.text}>Add Picture</Text>
				</TouchableOpacity>
				<ActionSheet3
					ref={ActionSheetRef3}
					title={'Select a Picture'}
					options={[
						{title: 'Take Picture', onPress: () => {launchCamera({}, setImage1)}},
						{title: 'Choose Picture from image library', onPress: () => {launchImageLibrary({}, setImage1)}},
					]}
					cancelTitle="cancel"
				/>
				<TouchableOpacity style={styles.button2} onPress={saveImage}>
					<Text style={styles.text}>Save</Text>
				</TouchableOpacity>
			</View>
		</>
	);
}

export default function App() {
	const Drawer = createDrawerNavigator();

	return (
		<NavigationContainer>
			<Drawer.Navigator useLegacyImplementation			
				screenOptions={{
					headerStyle: { backgroundColor: 'royalblue' },
					headerTintColor: 'white',
				}}
			>
				<Drawer.Screen name="ColdSpring Plate Checking" component={MainScreen} />
				<Drawer.Screen name="Image Filter" component={ImageFilterScreen} />
			</Drawer.Navigator>
		</NavigationContainer>
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
	container1: {
		width: '100%',
		height: undefined,
		aspectRatio: 1,
	},
	image: {
		width: '100%', 
		height: '100%', 
		resizeMode: 'contain',
	},
	text: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 15,
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-around',
	},
	button1: {
		backgroundColor: 'dodgerblue',
		paddingHorizontal: 28,
		padding: 7,
		borderRadius: 17,
	},
	button2: {
		backgroundColor: 'limegreen',
		paddingHorizontal: 50,
		padding: 7,
		borderRadius: 17,
	},
});