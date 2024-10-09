import React from "react";
import { getAuth } from "firebase/auth";
import { Card, Button, Text, Avatar } from 'react-native-paper';

export default function TrackWaterCard() {
    const userId = getAuth().currentUser?.uid || "PHCJD511ukbTHQfVXPu26N8rzqg1";
    const LeftContent = (props: any) => <Avatar.Icon {...props} icon="glass-pint-outline" />

    return (
        <Card style={[{ marginHorizontal: 10 }]}>
            <Card.Title title="Card Title" subtitle="Card Subtitle" left={LeftContent} />
            <Card.Content>
                <Text variant="titleLarge">Card title</Text>
                <Text variant="bodyMedium">Card content</Text>
            </Card.Content>
            <Card.Actions>
                <Button icon="delete">Delete</Button>
                <Button icon="pencil">Edit</Button>
            </Card.Actions>
        </Card>
    );
}