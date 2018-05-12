'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {CheckBox} from 'react-native-elements';

import {
    View,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Platform,
    ViewPropTypes as RNViewPropTypes,
} from 'react-native';

import styles from './style';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
    data:                           PropTypes.array,
    onChange:                       PropTypes.func,
    onModalOpen:                    PropTypes.func,
    onModalClose:                   PropTypes.func,
    keyExtractor:                   PropTypes.func,
    labelExtractor:                 PropTypes.func,
    visible:                        PropTypes.bool,
    initValue:                      PropTypes.oneOfType([PropTypes.array,PropTypes.string]),
    multiple:                       PropTypes.bool,
    animationType:                  Modal.propTypes.animationType,
    style:                          ViewPropTypes.style,
    selectStyle:                    ViewPropTypes.style,
    selectTextStyle:                Text.propTypes.style,
    optionStyle:                    ViewPropTypes.style,
    optionTextStyle:                Text.propTypes.style,
    optionContainerStyle:           ViewPropTypes.style,
    sectionStyle:                   ViewPropTypes.style,
    childrenContainerStyle:         ViewPropTypes.style,
    touchableStyle:                 ViewPropTypes.style,
    touchableActiveOpacity:         PropTypes.number,
    sectionTextStyle:               Text.propTypes.style,
    cancelContainerStyle:           ViewPropTypes.style,
    cancelStyle:                    ViewPropTypes.style,
    cancelTextStyle:                Text.propTypes.style,
    overlayStyle:                   ViewPropTypes.style,
    cancelText:                     PropTypes.string,
    disabled:                       PropTypes.bool,
    supportedOrientations:          Modal.propTypes.supportedOrientations,
    keyboardShouldPersistTaps:      PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    backdropPressToClose:           PropTypes.bool,
    accessible:                     PropTypes.bool,
    scrollViewAccessibilityLabel:   PropTypes.string,
    cancelButtonAccessibilityLabel: PropTypes.string,
    passThruProps:                  PropTypes.object,
};

const defaultProps = {
    data:                           [],
    onChange:                       () => {},
    onModalOpen:                    () => {},
    onModalClose:                   () => {},
    keyExtractor:                   (item) => item.key,
    labelExtractor:                 (item) => item.label,
    visible:                        false,
    multiple:                       false,
    initValue:                      "",
    animationType:                  'slide',
    style:                          {},
    selectStyle:                    {},
    selectTextStyle:                {},
    optionStyle:                    {},
    optionTextStyle:                {},
    optionContainerStyle:           {},
    sectionStyle:                   {},
    childrenContainerStyle:         {},
    touchableStyle:                 {},
    touchableActiveOpacity:         0.2,
    sectionTextStyle:               {},
    cancelContainerStyle:           {},
    cancelStyle:                    {},
    cancelTextStyle:                {},
    overlayStyle:                   {},
    cancelText:                     'cancel',
    disabled:                       false,
    supportedOrientations:          ['portrait', 'landscape'],
    keyboardShouldPersistTaps:      'always',
    backdropPressToClose:           false,
    accessible:                     false,
    scrollViewAccessibilityLabel:   undefined,
    cancelButtonAccessibilityLabel: undefined,
    passThruProps:                  {},
};

export default class ModalSelector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            modalVisible:  props.visible,
            cancelText:    props.cancelText,
            changedItem:   undefined,
        };
        
        if(props.multiple){
            this.state.selectedOptions = props.initValue;
        }else{
            this.state.selected = props.initValue;
        }

    }

    componentDidUpdate(prevProps, prevState) {
        let newState = {};
        let doUpdate = false;
        if (prevProps.initValue !== this.props.initValue) {
            newState.selected = this.props.initValue;
            doUpdate = true;
        }
        if (prevProps.visible !== this.props.visible) {
            newState.modalVisible = this.props.visible;
            doUpdate = true;
        }
        if (doUpdate) {
            this.setState(newState);
        }
    }
    
    isSelected(element,index){
        return element.label === this.label; 
    }

    onChange = (item) => {
        if (Platform.OS === 'android' || !Modal.propTypes.onDismiss) {
            // RN >= 0.50 on iOS comes with the onDismiss prop for Modal which solves RN issue #10471
            this.props.onChange(item);
        }
        this.setState({selected: this.props.labelExtractor(item), changedItem: item });
        this.close();
    }


    handleCheck = (option) => {
        let {selectedOptions} = this.state;
        const optionLabel = this.props.labelExtractor(option);
        const exists = selectedOptions.find(this.isSelected,option);
        if(exists === undefined){
            if(optionLabel === 'Everything'){
                selectedOptions = [option];    
            }else{
                const everything = selectedOptions.find(this.isSelected,{label:'Everything'});
                if(everything !== undefined){
                    const index = selectedOptions.indexOf(everything);
                    selectedOptions.splice(index, 1);
                }
                selectedOptions.push(option);
            }

            this.setState({selectedOptions : selectedOptions});
        
        }else{
            const index = selectedOptions.indexOf(exists);
            selectedOptions.splice(index, 1);
            this.setState({selectedOptions:selectedOptions});
        }
    }
    confirm = () => {
        const {selectedOptions} = this.state;
        this.props.onChange(selectedOptions);
        this.close();
    }
    close = () => {
        this.props.onModalClose();
        this.setState({
            modalVisible: false,
        });
    }

    open = () => {
        this.props.onModalOpen();
        this.setState({
            modalVisible: true,
            changedItem:  undefined,
        });
    }

    renderSection = (section) => {
        return (
            <View key={this.props.keyExtractor(section)} style={[styles.sectionStyle,this.props.sectionStyle]}>
                <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{this.props.labelExtractor(section)}</Text>
            </View>
        );
    }

    renderOption = (option, isLastItem) => {
        const {multiple} = this.props;
        let checked = false;
        if(multiple){
            const exists = this.state.selectedOptions.find(this.isSelected,option);
            if(exists !== undefined){
                checked = true;
            }
        }

        return (
            <TouchableOpacity
              key={this.props.keyExtractor(option)}
              activeOpacity={this.props.touchableActiveOpacity}
              accessible={this.props.accessible}
              onPress={multiple?()=>(false):() => this.onChange(option)}
              accessibilityLabel={option.accessibilityLabel || undefined}
              {...this.props.passThruProps}
            >
                <View style={[styles.optionStyle, this.props.optionStyle, isLastItem &&
                {borderBottomWidth: 0},{flexDirection:'row',flex:1,justifyContent:'space-evenly',alignItems:'center'}]}>
                    <Text style={[styles.optionTextStyle,this.props.optionTextStyle]}>{this.props.labelExtractor(option)}</Text>
                    {multiple?<CheckBox checked={checked} onPress={() => {this.handleCheck(option)}}></CheckBox>:false}
                </View>
            </TouchableOpacity>);
    }

    renderOptionList = () => {
        const {multiple} = this.props;
        let options = this.props.data.map((item, index) => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item, index === this.props.data.length - 1);
        });

        const closeOverlay = this.props.backdropPressToClose;

        return (
            <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)} onPress={() => {
                closeOverlay && this.close();
            }}>
                <View style={[styles.overlayStyle, this.props.overlayStyle]}>
                    <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps} accessible={this.props.accessible} accessibilityLabel={this.props.scrollViewAccessibilityLabel}>
                            <View style={{paddingHorizontal: 10}}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    {multiple?
                    <View style={[styles.cancelContainer, this.props.cancelContainerStyle,{marginBottom:5}]}>
                        <TouchableOpacity onPress={this.confirm} activeOpacity={this.props.touchableActiveOpacity} accessible={this.props.accessible} accessibilityLabel={this.props.cancelButtonAccessibilityLabel}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>confirm</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    :''}
                    <View style={[styles.cancelContainer, this.props.cancelContainerStyle]}>
                        <TouchableOpacity onPress={this.close} activeOpacity={this.props.touchableActiveOpacity} accessible={this.props.accessible} accessibilityLabel={this.props.cancelButtonAccessibilityLabel}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>);
    }

    renderChildren = () => {
        const {multiple} = this.props;
        if(this.props.children) {
            return this.props.children;
        }
        let selectedLabels = '';
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
            {multiple?this.state.selectedOptions.map((element,i) => {
                return <Text key={i} style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.props.labelExtractor(element)}</Text>
            }):
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
            }
                
            </View>
        );
    }

    render() {
        const {multiple} = this.props;
        const dp = (
            <Modal
                transparent={true}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.modalVisible}
                onRequestClose={this.close}
                animationType={this.props.animationType}
                onDismiss={multiple?() => (false):() => this.state.changedItem && this.props.onChange(this.state.changedItem)}
            >
                {this.renderOptionList()}
            </Modal>
        );

        return (
            <View style={this.props.style} {...this.props.passThruProps}>
                {dp}
                <TouchableOpacity activeOpacity={this.props.touchableActiveOpacity} style={this.props.touchableStyle} onPress={this.open} disabled={this.props.disabled}>
                    <View style={this.props.childrenContainerStyle} pointerEvents="none">
                        {this.renderChildren()}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
