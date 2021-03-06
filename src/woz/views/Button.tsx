/*
 * Copyright 2018. University of Southern California
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react"
import { Popup } from "semantic-ui-react"
import { isStringImagePath, isStringVideoPath, objectMap, styles } from "../../common/util"
import {
  ButtonIdentifier,
  PLACEHOLDER,
} from "../model/ButtonIdentifier"
import { ButtonOrigin, IButtonModel, MODEL } from "../model/ButtonModel"
import { IWozContext } from "../model/WozModel"
import css from "./button.module.css"
import { Label } from "./Label"
import {
  Icon,
} from "semantic-ui-react"

interface IButtonProperties {
  identifier: ButtonIdentifier
  context: IWozContext
  onButtonClick: (buttonModel: IButtonModel) => void
  showEditButton?: boolean
  onEditButtonClick: (buttonModel: IButtonModel) => void
  selectedButtons: Array<IButtonModel>
}

const BADGE_STYLES = {
  bottom: css.bottom,
  center: css.center,
  left: css.left,
  middle: css.middle,
  right: css.right,
  top: css.top,
}




export class Button extends React.Component<IButtonProperties, {}> {

  public render() {
    switch (this.props.identifier.kind) {
      case PLACEHOLDER:
        return (
          <div className={styles(css.button,
            css.placeholder)} />
        )
      // case MISSING:
      //   return (
      //       <div className={styles(css.button, css.missing)}>
      //         <Label model={{}}>Missing button with
      //           ID "{this.props.identifier.id}".</Label>
      //       </div>
      //   )
      case MODEL:
        const buttonModel = this.props.identifier
        const context = this.props.context

        const badgeStyles = (style: string): string[] => {
          const lowercased = style.toLocaleLowerCase()
          return Object.entries(BADGE_STYLES)
            .reduce((previousValue, currentValue) => {
              return new RegExp(currentValue[0], "g").test(lowercased)
                ? previousValue.concat([currentValue[1]])
                : previousValue
            }, [css.badge])
        }

        const badges = objectMap(buttonModel.badges,
          ([badgeID, badgeText]) =>
            <span key={badgeID}
              className={styles.apply(null,
                badgeStyles(badgeID))}>{badgeText}</span>)

        const buttonStyle = buttonModel.color !== undefined
          && context.colors[buttonModel.color]
          !== undefined ? {
          background: context.colors[buttonModel.color].css,
        } : {}

        const editButton = this.props.showEditButton ?
          <div className={styles(css.customEditButton)} onClick={(e) => {
            e.stopPropagation();
            this.props.onEditButtonClick(buttonModel)
          }}>
            <Icon name={"edit"} className={styles(css.customIcon)} />
          </div>
          : undefined


        // Check if the button should be selected
        var selectedClass = '';

        // We need to highlight a button only if one of these conditions has been satisfied. 
        // 1) If the button has been selected (hashedId matches)
        // 2) Or if, only for the search buttons, any of the paragraphs in the page has been selected (in order to show to the wizard)
        //    that one of the paragraphs has been selected. 
        if ((this.props.selectedButtons?.filter(button => button.hashedId === buttonModel.hashedId))?.length === 1
          || (buttonModel.buttonOrigin !== ButtonOrigin.excel
            && (this.props.selectedButtons?.filter(button => button.pageId === buttonModel.pageId))?.length !== 0)) {
          selectedClass = css.buttonSelected
        }
        // We need to check whether the button is an image or a normal paragraph
        const button = !isStringImagePath(buttonModel.tooltip) ? (


          // If the button is not an image then it could be a video. If it's a video 
          // the it should containe the <video_separator> tag to seperate the poster
          // image from the actual video url 
          isStringVideoPath(buttonModel.tooltip) ? (
            // Show VIDEO 
            <div className={styles(css.imageButton)}
              onClick={() => {
                this.props.onButtonClick(buttonModel)
              }}>
                <div className={styles(css.videoCover)}>
                  <Icon name="play" className={css.videoIcon}></Icon>
                </div>
                <img src={buttonModel.tooltip.split("<video_separator>")[0]} className={styles(css.imageButtonSrc)} alt={buttonModel.label}></img>
            </div>
          ) : (
            // Show TEXT
            <div className={styles(selectedClass, css.button, css.selectable)}
              onClick={() => {
                this.props.onButtonClick(buttonModel)
              }}
              style={buttonStyle}>
              {badges}
              <Label model={buttonModel}>{buttonModel.label}</Label>
              {editButton}
            </div>
          )
        ) : (
          // SHOW IMAGE
          <div className={styles(css.imageButton)}
            onClick={() => {
              this.props.onButtonClick(buttonModel)
            }}>
            <img src={buttonModel.tooltip} className={styles(css.imageButtonSrc)} alt={buttonModel.label}></img>
          </div>
        )

        // Change the popup style based on the type of button (text or image)
        // More precisely, we do not show the tooltip if the button is an image or a video 
        return !isStringImagePath(buttonModel.tooltip) && !isStringVideoPath(buttonModel.tooltip) ? (
          <Popup inverted={true} trigger={button} content={buttonModel.tooltip} />
        ) : (<Popup inverted={true} disabled trigger={button} content={buttonModel.tooltip} />)
    }

    return null
  }
}
