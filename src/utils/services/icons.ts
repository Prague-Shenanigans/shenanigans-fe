import { markRaw } from 'vue';

// Vite's import.meta.glob function is used to dynamically import all SVGs in the specified directory
// This creates an object where the keys are the paths to the SVG files and the values are functions that import those SVG files
const iconFiles = import.meta.glob('/src/assets/icons/*.svg');

const icons = {};

// Transform the iconFiles object into a direct mapping from iconName to import function
// This approach ensures we don't need to create the import path string each time an icon is needed
Object.entries(iconFiles).forEach(([path, importFunc]) => {
  // Extract the icon name by getting the file name and removing the .svg extension
  const iconName = path.split('/').pop()?.replace('.svg', '');
  if (iconName) {
    icons[iconName] = importFunc;
  }
});

// The above code runs only once when the script is loaded during the boot process
// ----------------------------------------------------------------------------------

/**
 * Function to dynamically load and return the component for the given iconName
 * This function is called on demand whenever an icon needs to be loaded
 *
 * @param iconName - The name of the icon to load (without the .svg extension)
 * @returns A Promise that resolves to the imported SVG component, or null if the icon is not found
 */
export const getIconComponent = async (iconName: string) => {
  try {
    const iconImport = icons[iconName];
    if (iconImport) {
      // Dynamically import the SVG component
      const { default: ImportedIcon } = await iconImport();
      // Mark the imported component as raw to prevent Vue from making it reactive
      return markRaw(ImportedIcon);
    }
    console.error(`Icon not found: ${iconName}`);
    return null;
  } catch (error) {
    console.error(`Failed to load icon: ${iconName}`, error);
    return null;
  }
};
