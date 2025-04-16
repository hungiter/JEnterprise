import IconIon from 'react-native-vector-icons/Ionicons'
import IconFontAwesome from 'react-native-vector-icons/FontAwesome5'
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons'
// import { PRIMARY_COLOR } from '../../styles/colors.global'
// import { TYPE_ICON } from '../../utils/constants.utils'
import { PixelRatio } from 'react-native'
// import tw from '../../styles/twrnc.global'

const IconCP = ({
  typeIcon,
  name,
  size = 25,
  color = PRIMARY_COLOR,
  style,
}) => {
  const IconCheck =
    typeIcon === TYPE_ICON.iconMaterial
      ? IconMaterial
      : typeIcon === TYPE_ICON.iconFontAwesome
      ? IconFontAwesome
      : IconIon
  const getDisplaySizeSystem = (originalSize) => {
    if (PixelRatio.get() < 1.5) {
      return (originalSize * 0.8) / PixelRatio.get()
    } else if (PixelRatio.get() >= 1.5 && PixelRatio.get() < 2.5) {
      return (originalSize * 1.8) / PixelRatio.get()
    } else if (PixelRatio.get() >= 2.5) {
      return (originalSize * 2.8) / PixelRatio.get()
    } else {
      return originalSize
    }
  }
  return (
    <>
      <IconCheck
        name={name}
        size={getDisplaySizeSystem(size)}
        color={color}
        style={tw.style({ ...style })}
      />
    </>
  )
}

export default IconCP
