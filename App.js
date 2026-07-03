// Gestion de la navigation entre les écrans
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Gestion de la barre de statut (heure, batterie)
import { StatusBar } from 'expo-status-bar';

// Import des écrans de l'application
import SearchScreen from './src/screens/SearchScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Création du navigateur de type Stack
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    // Conteneur principal de navigation
    <NavigationContainer>

      {/* Barre de statut en mode clair */}
      <StatusBar style="light" />

      {/* Configuration globale des écrans */}
      <Stack.Navigator
        screenOptions={{
          // Couleur de fond de l'en-tête
          headerStyle: {
            backgroundColor: '#0f0f1a',
          },

          // Couleur du texte et de l'icône retour
          headerTintColor: '#00babc',

          // Style du titre de l'en-tête
          headerTitleStyle: {
            fontWeight: '700',
          },

          // Couleur de fond des écrans
          contentStyle: {
            backgroundColor: '#0f0f1a',
          },
        }}
      >

        {/* Écran de recherche affiché au lancement */}
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            // Cache l'en-tête sur cet écran
            headerShown: false,
          }}
        />

        {/* Écran du profil utilisateur */}
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={({ route }) => ({
            // Utilise le login GitHub comme titre
            title: route.params?.user?.login ?? 'Profil',

            // Texte du bouton retour
            headerBackTitle: 'Retour',
          })}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}