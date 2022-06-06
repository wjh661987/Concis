import React, { FC, memo, Fragment, useState, useEffect, useCallback } from 'react';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';
import Input from '../Input';
import './index.module.less';

interface treeProps {
  /**
   * @description Tree配置参数
   */
  treeData: Array<treeNode>;
  /**
   * @description 宽度
   * @default 200px
   */
  width?: string;
  /**
   * @description 支持搜索
   * @default false
   */
  avaSearch?: boolean;
  /**
   * @description 支持多选
   * @default false
   */
  avaChooseMore?: boolean;
  /**
   * @description 全展开
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * @description 选择回调函数
   */
  chooseCallback?: Function;
}
interface treeNode {
  title: string;
  value: string;
  level: number;
  height?: string;
  children?: Array<treeNode>;
}

const Tree: FC<treeProps> = (props) => {
  const { width = '200', treeData, avaSearch, avaChooseMore, defaultOpen, chooseCallback } = props;

  const [stateTreeData, setStateTreeData] = useState<Array<treeNode>>(treeData); //树结构
  const [activedVal, setActivedVal] = useState<string>(''); //选中的节点值
  const [containerHeight, setContainerHeight] = useState<string>('0px'); //容器高度
  const [isFocus, setIsFocus] = useState(false); //聚焦状态

  useEffect(() => {
    resolveTreeData(treeData as Array<treeNode>, 1);
    window.addEventListener('click', () => setContainerHeight('0px'));
  }, []);

  const resolveTreeData = (treeData: Array<treeNode>, nowIndexLevel: number) => {
    //二次处理treeData
    treeData.forEach((treeNode: treeNode) => {
      treeNode.level = nowIndexLevel;
      if (defaultOpen) {
        //默认全展开
        treeNode.height = '30px';
      } else {
        treeNode.height = treeNode.level == 1 ? '30px' : '0';
      }
      if (treeNode?.children?.length) {
        //有子节点
        resolveTreeData(treeNode.children, nowIndexLevel + 1);
      } else {
        //没有子节点，重置level为当前层级，继续寻找
        nowIndexLevel = treeNode.level;
      }
    });
    setStateTreeData(treeData); //更新状态
    console.log(treeData);
  };
  const toggleTreeMenu = (clickTreeNode: treeNode) => {
    //菜单切换或直接选中终极节点
    if (clickTreeNode?.children?.length) {
      //菜单切换的情况
      const oldStateTree = [...stateTreeData];
      const editTreeNode = (treeNode: Array<treeNode>) => {
        //所选节点后代收起处理函数
        treeNode.forEach((child) => {
          //找到节点，对子节点进行处理
          if (child?.children?.length) {
            child.height = '0';
            editTreeNode(child.children);
          } else {
            child.height = '0';
          }
        });
      };
      const mapFn = (treeNode: Array<treeNode>) => {
        //深度优先查找节点函数
        treeNode.forEach((t: treeNode, i: number) => {
          if (t.title == clickTreeNode.title && t.value == t.value) {
            if (t?.children?.length) {
              //后代节点处理，如果打开，只需打开下一代即可，如果关闭，需要关闭所有后代
              if (t.children[0].height == '0') {
                //打开
                t.children = t.children.map((child: treeNode) => {
                  return {
                    ...child,
                    height: child.height == '0' ? '30px' : '0',
                  };
                });
              } else {
                //关闭
                editTreeNode(t.children); //对后代节点进行处理
              }
            }
          } else if (t?.children?.length) {
            mapFn(t.children);
          }
        });
      };
      mapFn(oldStateTree);
      setStateTreeData(oldStateTree);
    } else {
      //选中终极节点的情况
      if (avaChooseMore) {
        //多选
        if (activedVal.split(',').includes(clickTreeNode.title)) {
          //取消选中
          let updateVal: Array<string> | string = activedVal;
          updateVal = updateVal.split(',');
          updateVal.splice(
            activedVal.split(',').findIndex((t) => t == clickTreeNode.title),
            1,
          );
          updateVal = updateVal.join(',');
          setActivedVal(updateVal);
          chooseCallback && chooseCallback(updateVal);
        } else {
          setActivedVal(
            activedVal == '' ? clickTreeNode.title : activedVal + ',' + clickTreeNode.title,
          );
          chooseCallback &&
            chooseCallback(
              activedVal == '' ? clickTreeNode.title : activedVal + ',' + clickTreeNode.title,
            );
        }
      } else {
        //单选
        setActivedVal(clickTreeNode.title);
        chooseCallback && chooseCallback(clickTreeNode.title);
      }
    }
  };
  const handleIptChange = (val: string) => {
    //文本改变回调
    if (avaSearch) {
      setActivedVal(val);
    } else {
      setActivedVal('');
    }
  };
  const handleClick = () => {
    //点击回调
    if (avaSearch) {
      if (isFocus && containerHeight == '100%') {
        setContainerHeight('0px');
      } else {
        setContainerHeight('100%');
      }
    } else {
      setContainerHeight(containerHeight == '0px' ? '100%' : '0px');
    }
  };
  const handleIptFocus = () => {
    //聚焦回调
    setTimeout(() => {
      //异步，等待点击执行完毕
      if (!isFocus) {
        setIsFocus(true);
      }
    }, 150);
  };
  const handleIptBlur = () => {
    //失去焦点回调
    setIsFocus(false);
  };
  const searchStyle = useCallback(
    (treeNode: treeNode): string => {
      //搜索高亮样式
      if (treeNode.title.includes(activedVal) && activedVal !== '') {
        return '#1890FF';
      } else {
        return '#000000';
      }
    },
    [activedVal],
  );
  const activedStyle = useCallback(
    (treeNode: treeNode): string => {
      //选中高亮样式
      if (avaChooseMore) {
        //多选
        if (activedVal.split(',').includes(treeNode.title)) {
          return '#bae8ff';
        } else {
          return '#ffffff';
        }
      } else {
        //单选
        if (activedVal == treeNode.title) {
          return '#bae8ff';
        } else {
          return '#ffffff';
        }
      }
    },
    [activedVal],
  );
  const clearCallback = () => {
    //清空
    setActivedVal('');
  };
  const render = (data: Array<treeNode> = stateTreeData) => {
    //动态规划render函数
    return data.map((treeNode: treeNode, index) => {
      return (
        <Fragment key={index}>
          <div
            className="treeNode"
            style={{
              marginLeft: `${treeNode.level * 10}px`,
              height: `${treeNode.height}`,
              color: searchStyle(treeNode),
              background: activedStyle(treeNode),
            }}
            onClick={() => toggleTreeMenu(treeNode)}
          >
            {
              treeNode?.children?.length ? (
                treeNode.children[0].height == '0' ? (
                  <CaretDownOutlined />
                ) : (
                  <CaretRightOutlined />
                )
              ) : (
                <div style={{ width: '12px', height: '12px' }}></div>
              ) //空间占位符
            }

            <span className="text">{treeNode.title}</span>
          </div>
          {treeNode?.children?.length && render(treeNode.children)}
        </Fragment>
      );
    });
  };

  return (
    <Fragment>
      <div className="tree-container" onClick={(e) => e.stopPropagation()}>
        <Input
          moreStyle={avaSearch ? {} : { caretColor: 'transparent' }}
          placeholder={avaSearch ? '请输入' : ''}
          width={width}
          defaultValue={activedVal}
          handleClick={handleClick}
          handleIptChange={handleIptChange}
          handleIptFocus={handleIptFocus}
          handleIptBlur={handleIptBlur}
          clearCallback={clearCallback}
          showClear
        />

        <div
          className="tree-select-dialog"
          style={{
            width: `${width}px`,
            height: containerHeight,
            opacity: containerHeight == '0px' ? '0' : '1',
            padding: containerHeight == '0px' ? '0 10px 0 10px' : '10px',
          }}
        >
          {render()}
        </div>
      </div>
    </Fragment>
  );
};

export default memo(Tree);