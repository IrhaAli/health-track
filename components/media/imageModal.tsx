import React from "react";
import { Modal, Platform, View, Image, StyleSheet } from "react-native";
import { Portal, IconButton } from "react-native-paper";

interface ImageModalProps {
    visible: boolean;
    imageUri: string | null;
    onDismiss: () => void;
  }
  
  export function ImageModal({ visible, imageUri, onDismiss }: ImageModalProps) {
    return (
      <Portal>
        <Modal 
          visible={visible} 
          onDismiss={onDismiss}
          style={Platform.OS === 'ios' ? {
            margin: 0,
            backgroundColor: 'black',
            height: '100%',
            width: '100%'
          } : {
            flex: 1,
            backgroundColor: 'black',
            height: '100%',
            width: '100%'
          }}
        >
          {imageUri && (
            <View style={Platform.OS === 'ios' ? {
              flex: 1,
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: 'black'
            } : {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                style={Platform.select({
                  ios: styles.closeButtonIOS,
                  android: styles.closeButton
                })}
                iconColor="#fff"
              />
              <Image
                source={{ uri: imageUri }}
                style={Platform.select({
                  ios: { width: '100%', height: '100%' },
                  android: { width: '100%', height: '100%' }
                })}
                resizeMode="contain"
              />
            </View>
          )}
        </Modal>
      </Portal>
    );
  }
  
  const styles = StyleSheet.create({
    closeButton: {
      position: 'absolute',
      top: 45,
      right: 10,
      zIndex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    closeButtonIOS: {
      position: 'absolute',
      top: 50,
      right: 10,
      zIndex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    }
  });