import React from "react";
import { compose } from 'redux'
import { connect } from 'react-redux'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import * as actions from './action'
import { addCheckpoint } from './store/checkpointEnhancer'
import Block from './blocks'
import FullscreenBlock from './blocks/fullscreen'
import CodeMirror from 'react-codemirror'
import { getPlotData, addStylePrefix, isLayoutsEqual } from './utils'
import Yaml from 'yamljs'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import "react-tabs/style/react-tabs.css";
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import './Layout.css'

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const defaultBlockLayout = {
  x: 0,
  y: 0,
  w: 3,
  h: 3,
  minW: 3,
  minH: 3,
  moved: false,
  static: false,
}

const defaultBlockStyle = {

}

class ShowcaseLayout extends React.Component {
  static defaultProps = {
    rowHeight: 50,
    cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
    data: [],
  };

  state = {
    currentBreakpoint: "lg",
    fullscreen: null,
    mounted: false,
    editor: { value: '', style: JSON.stringify(defaultBlockStyle) },
  };

  componentDidMount() {
    this.setState({ mounted: true });
  }

  setBlockFullscreen = (key) => () => {
    this.setState({ fullscreen: key })
  }

  handleBlockLock = (key) => () => {
    this.props.updateBlockStatic(key)
  }

  removeBlock = (key) => () => {
    this.props.removeBlock(key)
  }

  closeFullscreen = () => {
    this.setState({ fullscreen: null })
  }

  onBreakpointChange = breakpoint => {
  this.setState({
    currentBreakpoint: breakpoint
  });
  };

  onEditorValueChange = (value) => {
    this.setState({ editor: { ...this.state.editor, value } })
  }

  onEditorStyleChange = (style) => {
    this.setState({ editor: { ...this.state.editor, style } })
  }

  closeEditor = () => {
    const { key, value, style } = this.state.editor
    if (!value) {
      this.props.toggleEditor('')
      return
    }
    const schema = (this.props.editor === 'markdown') ? {
      content: value
    } : Yaml.parse(value)
    // let containerStyle = {}
    // try {
    //   containerStyle = JSON.parse(style)
    // }
    this.props.addCheckpoint()
    if (this.props.blocks.find(b => b.key === key)) {
      // const containerStyle = JSON.parse(style)
      this.props.updateBlockSchema(key, schema)
    } else {
      const key = (this.props.blocks.length - 1).toString()
      const layout = this.props.blocks.find(c => c.layout.i === 'upload').layout || defaultBlockLayout

      this.props.addBlock(JSON.parse(JSON.stringify({
        key,
        layout: { ...layout,
          i: key,
        },
        block: { ...schema,
          type: this.props.editor,
        },
        style: JSON.parse(style),
      })))
    }
    this.cleanEditor('')
    this.props.toggleEditor('')
  }

  cleanEditor = () => {
    this.setState({
      editor: {
        key: '',
        value: '',
        style: JSON.stringify(defaultBlockStyle)
      }
    })
  }

  onLayoutChange = (layouts) => {
    if (this.state.mounted) {
      if (!isLayoutsEqual(this.props.blocks.map(c => c.layout), layouts))
        this.props.addCheckpoint()
      this.props.updateBlockLayouts(JSON.parse(JSON.stringify(layouts)))
    }
  }

  parseFile = (data, ext) => {
    let block = {}
    const key = (this.props.blocks.length - 1).toString()
    if (ext === 'yaml' || ext === 'yml') {
      block = { ...Yaml.parse(data), type: 'chart' }
    } else if (ext === 'md' || ext === 'markdown') {
      block = { content: addStylePrefix(data, `#markdown${key}>`), type: 'markdown' }
    } else if (ext === 'png' || ext === 'jpg' || ext === 'svg') {
      block = { content: data, type: 'image' }
    }
    const layout = this.props.blocks.find(c => c.layout.i === 'upload').layout || defaultBlockLayout
    this.props.addCheckpoint()
    this.props.addBlock(JSON.parse(JSON.stringify({
      key,
      layout: { ...layout,
        i: key,
        minH: 1,
        minW: 1,
      },
      block,
    })))
  }

  onDrop = (accept) => {
    accept.forEach((f) => {
      const reader = new FileReader()
      const { name } = f
      const extension = (/[.]/.exec(name)) ? /[^.]+$/.exec(name)[0] : undefined
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = (event) => {
        const fileAsBinaryString = reader.result;
        this.parseFile(fileAsBinaryString, extension)
      };
      if ((/(gif|jpg|jpeg|tiff|png)$/i).test(extension)) {
        reader.readAsDataURL(f);
      } else {
        reader.readAsBinaryString(f);
      }
    })
  }

  onChartOpen = (key, value, style) => () => {
    this.props.toggleEditor('chart');
    this.setState({
      editor: {
        key,
        value: Yaml.stringify(value),
        style,
      }
    })
  }

  onMarkdownOpen = (key, value, style) => () => {
    this.props.toggleEditor('markdown');
    this.setState({
      editor: {
        key,
        value,
        style,
      }
    })
  }


  getBlockProps = (block) => {
    const { layout, type, key, content, containerStyle=defaultBlockStyle, ...info } = block
    switch (type) {
      case 'upload':
        return {
          onDrop: this.onDrop,
        }
      case 'chart':
        return {
          height: layout.h*(this.props.rowHeight+10)-12,
          data: getPlotData(this.props.data, block),
          editBlock: this.onChartOpen(key, info, JSON.stringify(containerStyle)),
        }
      case 'markdown':
        return {
          data: content,
          editBlock: this.onMarkdownOpen(key, content, JSON.stringify(containerStyle)),
        }
      case 'image':
        return {
          data: content,
        }
      default:
        return {}
    }
  }

  getFullscreenBlockProps = (block) => {
    const { layout, type, key, content, containerStyle, ...info } = block
    switch (type) {
      case 'upload':
        return {
          onDrop: this.onDrop,
        }
      case 'chart':
        const chartData = getPlotData(this.props.data, block)
        return {
          data: {
            ...chartData,
            layout: { ...chartData.layout,
              plot_bgcolor: 'white',
              paper_bgcolor: 'white'
            }
          },
          editBlock: this.onChartOpen(key, info, JSON.stringify(containerStyle)),
        }
      case 'markdown':
        return {
          data: content,
          editBlock: this.onMarkdownOpen(key, content, JSON.stringify(containerStyle)),
        }
      case 'image':
        return {
          data: content,
        }
      default:
        return {}
    }
  }

  renderPlot = (l) => {
    const { layout, type, key, containerStyle } = l;
    const { product } = this.props
    return (
      <div key={key} style={containerStyle}>
        <Block
          layout={layout}
          type={type}
          product={product}
          handleLock={this.handleBlockLock(key)}
          removeBlock={this.removeBlock(key)}
          setFullscreen={this.setBlockFullscreen(key)}
          {...this.getBlockProps(l)}
        />
      </div>
    )
  }

  renderFullscreen = () => {
    const key = this.state.fullscreen
    const block = this.props.blocks.find(c => c.key === key)
    const props = this.getFullscreenBlockProps(block)
    return (
      <div className="overlay" onClick={this.closeFullscreen}>
        <div className="fullscreen-container">
          <FullscreenBlock
            type={block.type}
            onClick={(e) => {e.stopPropagation()}}
            close={this.closeFullscreen}
            {...props}
          />
        </div>
      </div>)
  }

  renderEditor = () => {
    const mode = (this.props.editor === 'chart')? 'yaml' : 'markdown'
    return (
      <div className="overlay">
        <div className="editor-container">
          <Tabs>
            <TabList className="tab-list">
              <Tab className="tab">Content</Tab>
              <Tab className="tab">Container Style</Tab>
            </TabList>
            <TabPanel>
              <CodeMirror
                className="editor"
                value={this.state.editor.value}
                onChange={this.onEditorValueChange}
                options={{ lineNumbers: true, mode }}
              />
            </TabPanel>
            <TabPanel>
              <CodeMirror
                className="editor"
                value={this.state.editor.style}
                onChange={this.onEditorStyleChange}
                options={{ lineNumbers: true, mode: 'javascript' }}
                defaultValue={JSON.stringify(defaultBlockStyle)}
              />
            </TabPanel>
          </Tabs>
          <i className="material-icons editor-close" onClick={this.closeEditor}>
            close
          </i>
        </div>
      </div>
    )
  }

  render() {
    const { product } = this.props
    const blocks = this.props.blocks.filter(b => !product || b.type !== 'upload')
    return (
      <div className="app-layout">
        <ResponsiveReactGridLayout
          {...this.props}
          className={`layout ${product? 'product':''}`}
          layouts={{[this.state.currentBreakpoint]: this.props.blocks.map(c => c.layout)}}
          isDraggable={!product}
          isResizable={!product}
          onBreakpointChange={this.onBreakpointChange}
          measureBeforeMount={false}
          onDragStop={this.onLayoutChange}
          onResizeStop={this.onLayoutChange}
          useCSSTransforms={this.state.mounted}
          compactType="vertical"
        >
          {blocks.map(this.renderPlot)}
        </ResponsiveReactGridLayout>
        {this.state.fullscreen ? this.renderFullscreen() : null}
        {this.props.editor ? this.renderEditor() : null}
      </div>
    );
  }
}

export default compose(connect(
    ({ connector, blocks, editor }) => ({
      data: connector.data ? connector.data : [],
      blocks: Object.keys(blocks).map(key => ({ key, ...blocks[key] })),
      editor
    }),
    { ...actions, addCheckpoint }
  ))(ShowcaseLayout);
