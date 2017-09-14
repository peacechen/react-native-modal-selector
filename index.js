'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    ViewPropTypes as RNViewPropTypes,
} from 'react-native';

import styles from './style';
import BaseComponent from './BaseComponent';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
    data:                      PropTypes.array,
    onChange:                  PropTypes.func,
    initValue:                 PropTypes.string,
    animationType:             Modal.propTypes.animationType,
    style:                     ViewPropTypes.style,
    selectStyle:               ViewPropTypes.style,
    selectTextStyle:           ViewPropTypes.style,
    optionStyle:               ViewPropTypes.style,
    optionTextStyle:           Text.propTypes.style,
    optionContainerStyle:      ViewPropTypes.style,
    sectionStyle:              ViewPropTypes.style,
    sectionTextStyle:          Text.propTypes.style,
    cancelStyle:               ViewPropTypes.style,
    cancelTextStyle:           Text.propTypes.style,
    overlayStyle:              ViewPropTypes.style,
    cancelText:                PropTypes.string,
    disabled:                  PropTypes.bool,
    supportedOrientations:     PropTypes.arrayOf(PropTypes.oneOf(['portrait', 'landscape', 'portrait-upside-down', 'landscape-left', 'landscape-right'])),
    keyboardShouldPersistTaps: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};

const defaultProps = {
    data:                      [],
    onChange:                  () => {},
    initValue:                 'Select me!',
    animationType:             'slide',
    style:                     {},
    selectStyle:               {},
    selectTextStyle:           {},
    optionStyle:               {},
    optionTextStyle:           {},
    optionContainerStyle:      {},
    sectionStyle:              {},
    sectionTextStyle:          {},
    cancelStyle:               {},
    cancelTextStyle:           {},
    overlayStyle:              {},
    cancelText:                'cancel',
    disabled:                  false,
    supportedOrientations:     ['portrait', 'landscape'],
    keyboardShouldPersistTaps: 'always',
};

export default class ModalSelector extends BaseComponent {

    constructor() {

        super();

        this._bind(
            'onChange',
            'open',
            'close',
            'renderChildren'
        );

        this.state = {
            modalVisible:  false,
            transparent:   false,
            selected:      'please select',
        };
    }

    componentDidMount() {
        this.setState({selected: this.props.initValue});
        this.setState({cancelText: this.props.cancelText});
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.initValue !== this.props.initValue) {
            this.setState({selected: nextProps.initValue});
        }
    }

    onChange(item) {
        this.props.onChange(item);
        this.setState({selected: item.label});
        this.close();
    }

    close() {
        this.setState({
            modalVisible: false,
        });
    }

    open() {
        this.setState({
            modalVisible: true,
        });
    }

    renderSection(section) {
        return (
            <View key={section.key} style={[styles.sectionStyle,this.props.sectionStyle]}>
                <Text style={[styles.sectionTextStyle,this.props.sectionTextStyle]}>{section.label}</Text>
            </View>
        );
    }

    renderOption(option) {
        return (
            <TouchableOpacity key={option.key} onPress={() => this.onChange(option)}>
                <View style={[styles.optionStyle, this.props.optionStyle]}>
                    <Text style={[styles.optionTextStyle,this.props.optionTextStyle]}>{option.label}</Text>
                </View>
            </TouchableOpacity>);
    }

    renderOptionList() {
        let options = this.props.data.map(item => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item);

        });

        return (
            <View style={[styles.overlayStyle, this.props.overlayStyle]} key={'modalSelector'+(componentIndex++)}>
                <View style={[styles.optionContainer, this.props.optionContainerStyle]}>
                    <ScrollView keyboardShouldPersistTaps={this.props.keyboardShouldPersistTaps}>
                        <View style={{paddingHorizontal: 10}}>
                            {options}
                        </View>
                    </ScrollView>
                </View>
                <View style={styles.cancelContainer}>
                    <TouchableOpacity onPress={this.close}>
                        <View style={[styles.cancelStyle, this.props.cancelStyle]}>
                            <Text style={[styles.cancelTextStyle,this.props.cancelTextStyle]}>{this.props.cancelText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </View>);
    }

    renderChildren() {

        if(this.props.children) {
            return this.props.children;
        }
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={[styles.selectTextStyle, this.props.selectTextStyle]}>{this.state.selected}</Text>
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
            >
                {this.renderOptionList()}
            </Modal>
        );

        return (
            <View style={this.props.style}>
                {dp}
                <TouchableOpacity onPress={this.open} disabled={this.props.disabled}>
                    <View pointerEvents="none">
                        {this.renderChildren()}
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;
