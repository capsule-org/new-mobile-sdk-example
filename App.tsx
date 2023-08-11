/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import uuid from 'react-native-uuid';

import React from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';

import {createUser, verifyEmail} from '@usecapsule/react-native-wallet';
// import '@usecapsule/react-native-wallet/test/quasitests';

import {
  USER_ID_TAG,
  ReactNativeCapsuleWallet,
} from '@usecapsule/react-native-wallet';

import AsyncStorage from '@react-native-async-storage/async-storage';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  // const array = new Uint32Array(10);
  // crypto.getRandomValues(array);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [idUser, setIdUser] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [step, setStep] = React.useState(0);
  const params = {
    // offloadMPCComputationURL:
    //   'https://partner-mpc-computation.beta.usecapsule.com',
  };
  const wallet = new ReactNativeCapsuleWallet(params);

  const handleSendEmail = async () => {
    await AsyncStorage.clear();
    const email = `example${uuid.v4()}@test.usecapsule.com`;
    setEmail(email);

    const {userId} = await createUser({
      email,
    });
    setIdUser(userId);
    setStep(1);
  };

  const handleConfirmEmail = async () => {
    await verifyEmail(idUser, {
      verificationCode: '123456',
    })
      .then(async _ => {
        setStep(2);
      })
      .catch(err => {
        console.log('error handleConfirmEmail ', err);
      });
    console.log(idUser + '|' + email);
  };

  const createWallet = async () => {
    try {
      await AsyncStorage.setItem(USER_ID_TAG, idUser + '|' + email);
      await wallet.initSessionManagement(true);
      console.log('Creating wallet...');
      await wallet.createAccount();
      console.log('Wallet created');
      setStep(3);
    } catch (err: any) {
      console.log({err});
    }
  };

  const signPersonalMessage = async () => {
    try {
      const transaction = await wallet.signPersonalMessage(
        (await wallet.getAccounts())[0],
        '0x' + Buffer.from('Hello world!').toString('hex'),
      );
      console.log(JSON.stringify(transaction, null, 2));
      setStep(4);
    } catch (err: any) {
      console.log({err});
    }
  };

  const login = async () => {
    try {
      const wallet = new ReactNativeCapsuleWallet();
      await wallet.importAccountViaWebAuth(email);
      console.log('Wallet imported');
    } catch (err: any) {
      console.log({err});
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          {step === 0 && (
            <Section title="Send Email to: `example${uuid.v4()}@test.usecapsule.com`">
              <TouchableOpacity onPress={handleSendEmail}>
                <Text>
                  Send OTP to: {`example${uuid.v4()}@test.usecapsule.com`}
                </Text>
              </TouchableOpacity>
            </Section>
          )}
          {step === 1 && (
            <Section title="Confirm otp">
              <TouchableOpacity onPress={handleConfirmEmail}>
                <Text>Confirm OTP</Text>
              </TouchableOpacity>
            </Section>
          )}
          {step === 2 && (
            <Section title="Create Wallet">
              <TouchableOpacity onPress={createWallet}>
                <Text>Create wallet</Text>
              </TouchableOpacity>
            </Section>
          )}
          {step === 3 && (
            <Section title="Sign Personal Message">
              <TouchableOpacity onPress={signPersonalMessage}>
                <Text>Sign personal message</Text>
              </TouchableOpacity>
            </Section>
          )}
          {step === 4 && (
            <Section title="You signed a transaction!">
              <Text>Good job!</Text>
            </Section>
          )}
          <Section title="Create Wallet">
            <TouchableOpacity onPress={login}>
              <Text>Login</Text>
            </TouchableOpacity>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
