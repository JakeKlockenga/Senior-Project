import {launchImageLibrary} from "react-native-image-picker";
import TextRecognition from "react-native-text-recognition";
import React, {useState, useEffect} from 'react';


export default function takePicture (setText){
    const [image, setImage] = useState(null);

    useEffect(()=>{
        launchImageLibrary({}, setImage);
    },[]);
    useEffect(()=>{
        (async()=>{
            if(image)
            {
                const result = await TextRecognition.recognize(image.assets[0].uri);
                console.log(result);
                setText(result);
            }
        })();
    },[image]);

}