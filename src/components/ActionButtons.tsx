import React from 'react';
import { View, StyleSheet } from 'react-native';
import { JuicyButton } from './JuicyButton';
import { SPACING } from '../constants/theme';


interface ActionButtonsProps {
    onFold: () => void;
    onCall: () => void;
    onRaise: () => void;
    disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onFold, onCall, onRaise, disabled }) => {
    return (
        <View style={styles.container}>
            <View style={styles.buttonWrapper}>
                <JuicyButton
                    title="FOLD"
                    variant="secondary" // Red
                    onPress={onFold}
                    disabled={disabled}
                />
            </View>

            <View style={styles.buttonWrapper}>
                <JuicyButton
                    title="CALL"
                    variant="primary" // Green
                    onPress={onCall}
                    disabled={disabled}
                />
            </View>

            <View style={styles.buttonWrapper}>
                <JuicyButton
                    title="RAISE"
                    variant="accent" // Blue
                    onPress={onRaise}
                    disabled={disabled}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        width: '100%',
    },
    buttonWrapper: {
        flex: 1,
        marginHorizontal: SPACING.xs,
    }
});
