type Props = React.PropsWithChildren<{
  className?: string;
  index?: number;
}>;

const gradients = [
  `radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,187,233,1) 100%)`,
  `radial-gradient(circle, rgba(255,175,189,1) 0%, rgba(100,216,255,1) 100%)`,
  `radial-gradient(circle, rgba(255,223,186,1) 0%, rgba(186,255,201,1) 100%)`,
];

export default function Gradient({ children, className, index = 0 }: Props) {
  const gradient = gradients[index % gradients.length];

  return (
    <div className={className}>
      {children}
      <style jsx>{`
        div {
          background: ${gradient};
        }
      `}</style>
    </div>
  );
}
