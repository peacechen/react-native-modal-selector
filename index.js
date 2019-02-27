'use strict';

import React from 'react';
import PropTypes from 'prop-types';

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
    closeOnChange:                  PropTypes.bool,
    initValue:                      PropTypes.string,
    animationType:                  PropTypes.oneOf(['none', 'slide', 'fade']),
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
    selectedItemTextStyle:          Text.propTypes.style,
    cancelContainerStyle:           ViewPropTypes.style,
    cancelStyle:                    ViewPropTypes.style,
    cancelTextStyle:                Text.propTypes.style,
    overlayStyle:                   ViewPropTypes.style,
    cancelText:                     PropTypes.string,
    disabled:                       PropTypes.bool,
    supportedOrientations:          PropTypes.arrayOf(
                                      PropTypes.oneOf([
                                        'portrait',
                                        'portrait-upside-down',
                                        'landscape',
                                        'landscape-left',
                                        'landscape-right',
                                      ]),
                                    ),
    keyboardShouldPersistTaps:      PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    backdropPressToClose:           PropTypes.bool,
    openButtonContainerAccessible:  PropTypes.bool,
    listItemAccessible:             PropTypes.bool,
    cancelButtonAccessible:         PropTypes.bool,
    scrollViewAccessible:           PropTypes.bool,
    scrollViewAccessibilityLabel:   PropTypes.string,
    cancelButtonAccessibilityLabel: PropTypes.string,
    passThruProps:                  PropTypes.object,
    selectTextPassThruProps:        PropTypes.object,
    optionTextPassThruProps:        PropTypes.object,
    modalOpenerHitSlop:             PropTypes.object,
    customSelector:                 PropTypes.node,
    selectedKey:                    PropTypes.any,
};

const defaultProps = {
    data:                           [],
    onChange:                       () => {},
    onModalOpen:                    () => {},
    onModalClose:                   () => {},
    keyExtractor:                   (item) => item.key,
    labelExtractor:                 (item) => item.label,
    componentExtractor:             (item) => item.component,
    visible:                        false,
    closeOnChange:                  true,
    initValue:                      'Select me!',
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
    selectedItemTextStyle:          {},
    cancelContainerStyle:           {},
    cancelStyle:                    {},
    cancelTextStyle:                {},
    overlayStyle:                   {},
    cancelText:                     'cancel',
    disabled:                       false,
    supportedOrientations:          ['portrait', 'landscape'],
    keyboardShouldPersistTaps:      'always',
    backdropPressToClose:           false,
    openButtonContainerAccessible:  false,
    listItemAccessible:             false,
    cancelButtonAccessible:         false,
    scrollViewAccessible:           false,
    scrollViewAccessibilityLabel:   undefined,
    cancelButtonAccessibilityLabel: undefined,
    passThruProps:                  {},
    selectTextPassThruProps:        {},
    optionTextPassThruProps:        {},
    modalOpenerHitSlop:             {top: 0, bottom: 0, left: 0, right: 0},
    customSelector:                 undefined,
    selectedKey:                    '',
};

export default class ModalSelector extends React.Component {

    constructor(props) {
        super(props);
        let selectedItem = this.validateSelectedKey(props.selectedKey);
        this.state = {
            modalVisible:  props.visible,
            selected:      selectedItem.label,
            cancelText:    props.cancelText,
            changedItem:   selectedItem.key,
        };
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
        if(prevProps.selectedKey !== this.props.selectedKey){
            let selectedItem = this.validateSelectedKey(this.props.selectedKey);
            newState.selected = selectedItem.label;
            newState.changedItem = selectedItem.key;
            doUpdate = true;
        }
        if (doUpdate) {
            this.setState(newState);
        }
    }

    validateSelectedKey = (key) => {
        let selectedItem = this.props.data.filter((item) => this.props.keyExtractor(item) === key);
        let selectedLabel = selectedItem.length > 0 ? this.props.labelExtractor(selectedItem[0]) : this.props.initValue;
        let selectedKey = selectedItem.length > 0 ? key : undefined;
        return {label: selectedLabel, key: selectedKey}
    }

    onChange = (item) => {
        if (Platform.OS === 'android' || (Modal.propTypes !== undefined && !Modal.propTypes.onDismiss)) { // don't know if this will work for previous version, please check!
            // RN >= 0.50 on iOS comes with the onDismiss prop for Modal which solves RN issue #10471
            this.props.onChange(item);
        }
        this.setState({ selected: this.props.labelExtractor(item), changedItem: item }, () => {
          if (this.props.closeOnChange)
            this.close();
        });
    }

    getSelectedItem() {
      return this.state.changedItem;
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
        const optionComponent = this.props.componentExtractor(section);
        let component = optionComponent || (
          <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{this.props.labelExtractor(section)}</Text>
        );

        return (
            <View key={this.props.keyExtractor(section)} style={[styles.sectionStyle,this.props.sectionStyle]}>
                {component}
            </View>
        );
    }

    renderOption = (option, isLastItem, isFirstItem) => {
        const optionComponent = this.props.componentExtractor(option);
        const optionLabel = this.props.labelExtractor(option);
        const isSelectedItem = optionLabel === this.state.selected;

        let component = optionComponent || (
          <Text style={[styles.optionTextStyle,this.props.optionTextStyle,isSelectedItem && this.props.selectedItemTextStyle]} {...this.props.optionTextPassThruProps}>
              {optionLabel}
          </Text>
        );

        return (
            <TouchableOpacity
              key={this.props.keyExtractor(option)}
              onPress={() => this.onChange(option)}
              activeOpacity={this.props.touchableActiveOpacity}
              accessible={this.props.listItemAccessible}
              accessibilityLabel={option.accessibilityLabel || undefined}
              importantForAccessibility={isFirstItem}
              {...this.props.passThruProps}
            >
                <View style={[styles.optionStyle, this.props.optionStyle, isLastItem && {borderBottomWidth: 0}]}>
                  {component}
                </View>
            </TouchableOpacity>);
    }

    renderOptionList = () => {

        let options = this.props.data.map((item, index) => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item, index === this.props.data.length - 1, index === 0);
        });

        const closeOverlay = this.props.backdropPressToClose;

        return (
            <TouchableWithoutFeedback key={'modalSelector' + (componentIndex++)}  accessible={false} onPress={() => {
                closeOverlay && this.close();
            }}>
                <View style={[styles.overlayStyle, this.props.overlayStyle]}>
                    <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                        <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps} accessible={this.props.scrollViewAccessible} accessibilityLabel={this.props.scrollViewAccessibilityLabel}>
                            <View style={{paddingHorizontal: 10}}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={[styles.cancelContainer, this.props.cancelContainerStyle]}>
                        <TouchableOpacity onPress={this.close} activeOpacity={this.props.touchableActiveOpacity} accessible={this.props.cancelButtonAccessible} accessibilityLabel={this.props.cancelButtonAccessibilityLabel}>
                            <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                                <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>);
    }

    renderChildren = () => {

        if(this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]} {...this.props.selectTextPassThruProps}>{this.state.selected}</Text>
            </View>
        );
    }

    render() {

        const dp = (
            <Modal
                transparent={true}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.modalVisible}
                onRequestClose={this.close}
                animationType={this.props.animationType}
                onDismiss={() => this.state.changedItem && this.props.onChange(this.state.changedItem)}
            >
                {this.renderOptionList()}
            </Modal>
        );

        return (
            <View style={this.props.style} {...this.props.passThruProps}>
                {dp}
                {this.props.customSelector ?
                    this.props.customSelector
                    :
                    <TouchableOpacity
                        hitSlop={this.props.modalOpenerHitSlop}
                        activeOpacity={this.props.touchableActiveOpacity}
                        style={this.props.touchableStyle}
                        onPress={this.open}
                        disabled={this.props.disabled}
                        accessible={this.props.openButtonContainerAccessible}
                    >
                        <View style={this.props.childrenContainerStyle} pointerEvents="none">
                            {this.renderChildren()}
                        </View>
                    </TouchableOpacity>
                }
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
